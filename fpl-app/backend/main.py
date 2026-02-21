"""
FPL AI Decision Engine — FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import pandas as pd
import requests
import joblib
import pulp

# ── Configuration ──────────────────────────────────────────────────────────────
# Adjust these to match your folder layout (same as the notebook)
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
DATA_DIR   = BASE_DIR / "Data" / "data"
MODELS_DIR = BASE_DIR / "Data" / "models"

app = FastAPI(title="FPL AI Decision Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURES = [
    "avg_pts_last3", "avg_pts_last5", "form_trend",
    "avg_minutes_last3", "avg_xgi_last3", "avg_ict_last3",
    "avg_bps_last3", "is_home", "value", "avg_fixture_difficulty",
]

# ── Cache ──────────────────────────────────────────────────────────────────────
_model       = None
_predictions = None


def get_model():
    global _model
    if _model is None:
        path = MODELS_DIR / "fpl_model.pkl"
        if not path.exists():
            raise HTTPException(500, f"Model not found at {path}. Run the notebook first.")
        _model = joblib.load(path)
    return _model


def get_predictions() -> pd.DataFrame:
    global _predictions
    if _predictions is None:
        path = DATA_DIR / "player_predictions.csv"
        if not path.exists():
            raise HTTPException(500, f"Predictions CSV not found at {path}. Run the notebook first.")
        df = pd.read_csv(path)
        try:
            r          = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/", timeout=10).json()
            teams      = pd.DataFrame(r["teams"])
            players    = pd.DataFrame(r["elements"])[["id", "status"]]
            team_map   = teams.set_index("id")["name"].to_dict()
            status_map = players.set_index("id")["status"].to_dict()
            df["team_name"] = df["team"].map(team_map)
            df["status"]    = df["player_id"].map(status_map)
        except Exception:
            df["team_name"] = df["team"].astype(str)
            df["status"]    = "a"
        pos_map            = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"}
        df["position"]     = df["element_type"].map(pos_map)
        df["price"]        = df["now_cost"] / 10
        df["predicted_pts"] = df["predicted_pts"].round(2)
        _predictions        = df
    return _predictions


# ── Pydantic schemas ───────────────────────────────────────────────────────────
class OptimizeRequest(BaseModel):
    budget: float = 100.0


class TransferRequest(BaseModel):
    team_id: int
    free_transfers: int = 1
    hit_cost: int = 4
    locked_players: list[str] = []


# ── ILP helpers ────────────────────────────────────────────────────────────────
def _run_squad_ilp(df: pd.DataFrame, budget_raw: int):
    df = df.reset_index(drop=True)
    n  = len(df)

    prob = pulp.LpProblem("FPL_Squad", pulp.LpMaximize)
    x    = [pulp.LpVariable(f"x{i}", cat="Binary") for i in range(n)]

    prob += pulp.lpSum(df["predicted_pts"][i] * x[i] for i in range(n))
    prob += pulp.lpSum(x) == 15
    prob += pulp.lpSum(df["now_cost"][i] * x[i] for i in range(n)) <= budget_raw

    for pos, mn, mx in [("GK",2,2),("DEF",5,5),("MID",5,5),("FWD",3,3)]:
        idx = df[df["position"] == pos].index.tolist()
        prob += pulp.lpSum(x[i] for i in idx) >= mn
        prob += pulp.lpSum(x[i] for i in idx) <= mx

    for club in df["team"].unique():
        idx = df[df["team"] == club].index.tolist()
        prob += pulp.lpSum(x[i] for i in idx) <= 3

    cheap_outfield = df[(df["now_cost"] <= 50) & (df["position"] != "GK")].index.tolist()
    prob += pulp.lpSum(x[i] for i in cheap_outfield) >= 3
    cheap_gk       = df[(df["now_cost"] <= 40) & (df["position"] == "GK")].index.tolist()
    prob += pulp.lpSum(x[i] for i in cheap_gk) >= 1

    prob.solve(pulp.PULP_CBC_CMD(msg=0))
    squad = df[[x[i].value() == 1 for i in range(n)]].copy().reset_index(drop=True)

    m     = len(squad)
    prob2 = pulp.LpProblem("FPL_Starting11", pulp.LpMaximize)
    y     = [pulp.LpVariable(f"y{i}", cat="Binary") for i in range(m)]

    prob2 += pulp.lpSum(squad["predicted_pts"][i] * y[i] for i in range(m))
    prob2 += pulp.lpSum(y) == 11

    for pos, mn, mx in [("GK",1,1),("DEF",3,5),("MID",3,5),("FWD",1,3)]:
        idx = squad[squad["position"] == pos].index.tolist()
        prob2 += pulp.lpSum(y[i] for i in idx) >= mn
        prob2 += pulp.lpSum(y[i] for i in idx) <= mx

    prob2.solve(pulp.PULP_CBC_CMD(msg=0))
    squad["is_starter"] = [y[i].value() == 1 for i in range(m)]
    return squad


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/players")
def get_players(
    position:       Optional[str] = None,
    max_price:      float = 15.0,
    only_available: bool  = True,
    limit:          int   = 50,
):
    df = get_predictions().copy()
    if position:
        df = df[df["position"] == position.upper()]
    df = df[df["price"] <= max_price]
    if only_available:
        df = df[df["status"] == "a"]
    df   = df.sort_values("predicted_pts", ascending=False).head(limit)
    cols = ["player_id", "web_name", "team_name", "position", "price", "predicted_pts", "status"]
    return df[cols].to_dict(orient="records")


@app.get("/api/model/insights")
def get_model_insights():
    model      = get_model()
    importances = dict(zip(FEATURES, [int(v) for v in model.feature_importances_]))
    sorted_imp  = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    return {
        "model":               "LightGBM (Optuna-tuned)",
        "mae":                 1.021,
        "baseline_mae":        1.563,
        "improvement_pct":     34.7,
        "training_rows":       19069,
        "feature_importances": sorted_imp,
        "model_comparison": [
            {"model": "Baseline (mean)",               "mae": 1.563, "improvement": "—"},
            {"model": "Linear Regression",             "mae": 1.053, "improvement": "32.6%"},
            {"model": "Random Forest",                 "mae": 1.052, "improvement": "32.7%"},
            {"model": "LightGBM",                      "mae": 1.040, "improvement": "33.5%"},
            {"model": "LightGBM + Fixture Difficulty", "mae": 1.040, "improvement": "33.5%"},
            {"model": "LightGBM Tuned (Optuna)",       "mae": 1.021, "improvement": "34.7%"},
        ],
    }


@app.post("/api/squad/optimize")
def optimize_squad(req: OptimizeRequest):
    df         = get_predictions().copy()
    df         = df[df["status"] == "a"].reset_index(drop=True)
    budget_raw = int(req.budget * 10)
    squad      = _run_squad_ilp(df, budget_raw)
    starters   = squad[squad["is_starter"] == True]
    bench      = squad[squad["is_starter"] == False]
    cols       = ["web_name", "team_name", "position", "price", "predicted_pts", "is_starter"]
    return {
        "total_cost":       round(squad["now_cost"].sum() / 10, 1),
        "predicted_points": round(float(starters["predicted_pts"].sum()), 2),
        "budget_remaining": round(req.budget - squad["now_cost"].sum() / 10, 1),
        "starters":         starters[cols].to_dict(orient="records"),
        "bench":            bench[cols].to_dict(orient="records"),
    }


@app.get("/api/transfers/squad/{team_id}")
def fetch_fpl_squad(team_id: int):
    BASE = "https://fantasy.premierleague.com/api"
    try:
        boot      = requests.get(f"{BASE}/bootstrap-static/", timeout=10).json()
        events_df = pd.DataFrame(boot["events"])
        current_rows = events_df[events_df["is_current"] == True]
        if len(current_rows):
            current_gw = int(current_rows["id"].iloc[0])
        else:
            finished   = events_df[events_df["finished"] == True]
            current_gw = int(finished["id"].max()) if len(finished) else 1

        entry_r = requests.get(f"{BASE}/entry/{team_id}/", timeout=10).json()
        if "detail" in entry_r:
            raise HTTPException(404, f"Team ID {team_id} not found.")

        entry_gw = entry_r.get("current_event") or current_gw
        picks_gw = min(current_gw, entry_gw)
        itb      = entry_r.get("last_deadline_bank", 0) / 10
        free_tf  = entry_r.get("last_deadline_free_transfers", 1) or 1

        picks_r = None
        used_gw = picks_gw
        for gw_try in [picks_gw, picks_gw - 1, picks_gw + 1]:
            if gw_try < 1:
                continue
            resp = requests.get(f"{BASE}/entry/{team_id}/event/{gw_try}/picks/", timeout=10).json()
            if "picks" in resp:
                picks_r = resp
                used_gw = gw_try
                break

        if picks_r is None:
            raise HTTPException(404, "Could not retrieve picks. Make sure you have submitted your team.")

        player_ids = [p["element"] for p in picks_r["picks"]]
        df         = get_predictions()
        squad_df   = df[df["player_id"].isin(player_ids)][
            ["player_id", "web_name", "team_name", "position", "price", "predicted_pts", "status"]
        ].copy()
        return {
            "gameweek":       used_gw,
            "itb":            round(float(itb), 1),
            "free_transfers": int(free_tf),
            "players":        squad_df.to_dict(orient="records"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/api/transfers/optimize")
def optimize_transfers(req: TransferRequest):
    squad_data = fetch_fpl_squad(req.team_id)
    squad_ids  = [p["player_id"] for p in squad_data["players"]]

    df               = get_predictions().copy()
    current_squad_df = df[df["player_id"].isin(squad_ids)]
    if len(current_squad_df) < 11:
        raise HTTPException(400, f"Only matched {len(current_squad_df)} players. Regenerate predictions.")

    squad_value      = current_squad_df["now_cost"].sum() / 10
    total_budget_raw = int((squad_value + squad_data["itb"]) * 10)

    opt_df               = df[(df["status"] == "a") | (df["player_id"].isin(squad_ids))].copy().reset_index(drop=True)
    opt_df["in_current"] = opt_df["player_id"].isin(squad_ids).astype(int)
    n = len(opt_df)

    prob = pulp.LpProblem("FPL_Transfers", pulp.LpMaximize)
    x    = [pulp.LpVariable(f"x{i}", cat="Binary") for i in range(n)]
    t    = [pulp.LpVariable(f"t{i}", cat="Binary") for i in range(n)]
    s    = [pulp.LpVariable(f"s{i}", cat="Binary") for i in range(n)]
    h    = pulp.LpVariable("hits", lowBound=0, cat="Continuous")

    prob += pulp.lpSum(opt_df["predicted_pts"][i] * x[i] for i in range(n)) - req.hit_cost * h
    prob += pulp.lpSum(x) == 15
    prob += pulp.lpSum(opt_df["now_cost"][i] * x[i] for i in range(n)) <= total_budget_raw

    for pos, mn, mx in [("GK",2,2),("DEF",5,5),("MID",5,5),("FWD",3,3)]:
        idx = opt_df[opt_df["position"] == pos].index.tolist()
        prob += pulp.lpSum(x[i] for i in idx) >= mn
        prob += pulp.lpSum(x[i] for i in idx) <= mx

    for club in opt_df["team"].unique():
        idx = opt_df[opt_df["team"] == club].index.tolist()
        prob += pulp.lpSum(x[i] for i in idx) <= 3

    cheap_gk = opt_df[(opt_df["now_cost"] <= 40) & (opt_df["position"] == "GK")].index.tolist()
    prob += pulp.lpSum(x[i] for i in cheap_gk) >= 1

    if req.locked_players:
        locked_idx = opt_df[opt_df["web_name"].isin(req.locked_players)].index.tolist()
        for i in locked_idx:
            prob += x[i] == 1
            prob += s[i] == 0
            prob += t[i] == 0

    for i in range(n):
        ic = opt_df["in_current"][i]
        prob += t[i] >= x[i] - ic
        prob += t[i] <= x[i]
        prob += t[i] <= 1 - ic
        prob += s[i] >= ic - x[i]
        prob += s[i] <= ic
        prob += s[i] <= 1 - x[i]

    prob += pulp.lpSum(t) == pulp.lpSum(s)
    prob += h >= pulp.lpSum(t) - req.free_transfers
    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    new_squad     = opt_df[[x[i].value() == 1 for i in range(n)]].copy()
    transfers_in  = new_squad[new_squad["in_current"] == 0]
    out_ids       = [pid for pid in squad_ids if pid not in new_squad["player_id"].values]
    transfers_out = df[df["player_id"].isin(out_ids)]
    n_in          = len(transfers_in)
    hits_taken    = max(0, n_in - req.free_transfers)
    pts_gain      = float(transfers_in["predicted_pts"].sum() - transfers_out["predicted_pts"].sum())
    cols          = ["player_id", "web_name", "team_name", "position", "price", "predicted_pts"]

    return {
        "transfers_made":  n_in,
        "hits_taken":      hits_taken,
        "points_hit":      hits_taken * req.hit_cost,
        "net_pts_gain":    round(pts_gain - hits_taken * req.hit_cost, 2),
        "transfers_in":    transfers_in[cols].to_dict(orient="records"),
        "transfers_out":   transfers_out[cols].to_dict(orient="records"),
        "new_squad":       new_squad[cols + ["in_current"]].to_dict(orient="records"),
        "gameweek":        squad_data["gameweek"],
        "itb":             round(float(squad_data["itb"]), 1),
    }
