"""
FPL AI Decision Engine — FastAPI Backend
Fix: robust path resolution, debug endpoint, live-API fallback when
     model/CSV files are missing (notebook not yet run).
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import pandas as pd
import numpy as np
import requests
import os

# ── Optional heavy imports (graceful fallback if not installed) ────────────────
try:
    import joblib
    JOBLIB_OK = True
except ImportError:
    JOBLIB_OK = False

try:
    import pulp
    PULP_OK = True
except ImportError:
    PULP_OK = False

# ── Path resolution ────────────────────────────────────────────────────────────
# main.py lives at:  <root>/fpl-app/backend/main.py
# Data lives at:     <root>/Data/data/  and  <root>/Data/models/
# We walk up until we find a folder that contains both "fpl-app" and "Data",
# or fall back to env-var overrides.

def _find_root() -> Path:
    """
    Data/ always sits alongside fpl-app/, so it is exactly 2 levels
    up from this file:
      <root>/fpl-app/backend/main.py  →  parent = backend/
                                        →  parent = fpl-app/
                                        →  parent = <root>   ✓
    Override with env-var FPL_ROOT if needed.
    """
    env_root = os.environ.get("FPL_ROOT")
    if env_root:
        return Path(env_root)
    # main.py → backend → fpl-app → <root>
    return Path(__file__).resolve().parent.parent.parent

ROOT_DIR   = _find_root()
DATA_DIR   = Path(os.environ.get("FPL_DATA_DIR",   str(ROOT_DIR / "Data" / "data")))
MODELS_DIR = Path(os.environ.get("FPL_MODELS_DIR", str(ROOT_DIR / "Data" / "models")))

MODEL_PATH = MODELS_DIR / "fpl_model.pkl"
PREDS_PATH = DATA_DIR   / "player_predictions.csv"

app = FastAPI(title="FPL AI Decision Engine", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
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
    if _model is not None:
        return _model
    if not JOBLIB_OK:
        raise HTTPException(500, "joblib not installed. Run: pip install joblib")
    if not MODEL_PATH.exists():
        raise HTTPException(
            500,
            f"Model file not found at '{MODEL_PATH}'. "
            "You need to run your Jupyter notebook (FPL_Pipeline_Fixed.ipynb) "
            "first to generate fpl_model.pkl. "
            f"Expected location: {MODEL_PATH}"
        )
    _model = joblib.load(MODEL_PATH)
    return _model


def _fetch_live_fpl_data() -> pd.DataFrame:
    """
    Fallback: build a basic player DataFrame directly from the FPL API
    when player_predictions.csv is missing (notebook not run yet).
    Points are estimated from season total / games played.
    """
    r        = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/", timeout=15).json()
    teams    = pd.DataFrame(r["teams"])
    elements = pd.DataFrame(r["elements"])

    team_map  = teams.set_index("id")["name"].to_dict()
    pos_map   = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"}

    df = elements.copy()
    df["player_id"]   = df["id"]
    df["web_name"]    = df["web_name"]
    df["team_name"]   = df["team"].map(team_map)
    df["position"]    = df["element_type"].map(pos_map)
    df["price"]       = df["now_cost"] / 10
    df["status"]      = df["status"]
    df["now_cost"]    = df["now_cost"]
    df["element_type"] = df["element_type"]

    # Estimate predicted_pts from recent form (points_per_game from FPL API)
    df["predicted_pts"] = pd.to_numeric(df["points_per_game"], errors="coerce").fillna(0).round(2)

    # Rolling averages — approximate from season totals
    gp = pd.to_numeric(df.get("minutes", 0), errors="coerce").fillna(0) / 90
    gp = gp.clip(lower=1)
    df["avg_pts_last3"]  = df["predicted_pts"]
    df["avg_xgi_last3"]  = (
        pd.to_numeric(df.get("expected_goal_involvements", 0), errors="coerce").fillna(0) / gp
    ).round(2)

    return df[[
        "player_id", "web_name", "team_name", "team", "position",
        "price", "now_cost", "predicted_pts", "status",
        "element_type", "avg_pts_last3", "avg_xgi_last3",
    ]]


def get_predictions() -> pd.DataFrame:
    global _predictions
    if _predictions is not None:
        return _predictions

    if PREDS_PATH.exists():
        # ── Normal path: notebook has been run ────────────────────────────────
        df = pd.read_csv(PREDS_PATH)
        try:
            r          = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/", timeout=10).json()
            teams      = pd.DataFrame(r["teams"])
            players    = pd.DataFrame(r["elements"])[["id", "status"]]
            team_map   = teams.set_index("id")["name"].to_dict()
            status_map = players.set_index("id")["status"].to_dict()
            df["team_name"] = df["team"].map(team_map)
            df["status"]    = df["player_id"].map(status_map)
        except Exception:
            df["team_name"] = df.get("team_name", df["team"].astype(str))
            df["status"]    = df.get("status", "a")

        pos_map             = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"}
        df["position"]      = df["element_type"].map(pos_map)
        df["price"]         = df["now_cost"] / 10
        df["predicted_pts"] = df["predicted_pts"].round(2)

        # Ensure rolling avg columns exist (older CSVs may not have them)
        for col in ["avg_pts_last3", "avg_xgi_last3"]:
            if col not in df.columns:
                df[col] = df["predicted_pts"]

    else:
        # ── Fallback: notebook not run yet, use live FPL API ─────────────────
        try:
            df = _fetch_live_fpl_data()
        except Exception as e:
            raise HTTPException(
                500,
                f"player_predictions.csv not found at '{PREDS_PATH}' AND "
                f"live FPL API fetch failed: {e}. "
                "Please run your Jupyter notebook to generate predictions."
            )

    _predictions = df
    return _predictions


# ── Pydantic schemas ───────────────────────────────────────────────────────────
class OptimizeRequest(BaseModel):
    budget: float = 100.0


class TransferRequest(BaseModel):
    team_id:        int
    free_transfers: int       = 1
    hit_cost:       int       = 4
    locked_players: list[str] = []


# ── ILP helper ─────────────────────────────────────────────────────────────────
def _run_squad_ilp(df: pd.DataFrame, budget_raw: int):
    if not PULP_OK:
        raise HTTPException(500, "pulp not installed. Run: pip install pulp")

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

    cheap_gk = df[(df["now_cost"] <= 40) & (df["position"] == "GK")].index.tolist()
    if cheap_gk:
        prob += pulp.lpSum(x[i] for i in cheap_gk) >= 1

    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    selected = [x[i].value() == 1 for i in range(n)]
    squad    = df[selected].copy().reset_index(drop=True)

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
    return {
        "status":       "ok",
        "model_found":  MODEL_PATH.exists(),
        "preds_found":  PREDS_PATH.exists(),
        "root_dir":     str(ROOT_DIR),
        "data_dir":     str(DATA_DIR),
        "models_dir":   str(MODELS_DIR),
    }


@app.get("/api/debug")
def debug():
    """
    Diagnostic endpoint — open http://localhost:8000/api/debug in your browser
    to see exactly what paths are being checked and what's missing.
    """
    return {
        "root_dir":         str(ROOT_DIR),
        "data_dir":         str(DATA_DIR),
        "models_dir":       str(MODELS_DIR),
        "model_path":       str(MODEL_PATH),
        "preds_path":       str(PREDS_PATH),
        "model_exists":     MODEL_PATH.exists(),
        "preds_exists":     PREDS_PATH.exists(),
        "data_dir_exists":  DATA_DIR.exists(),
        "models_dir_exists":MODELS_DIR.exists(),
        "data_dir_files":   [str(p.name) for p in DATA_DIR.iterdir()] if DATA_DIR.exists() else [],
        "models_dir_files": [str(p.name) for p in MODELS_DIR.iterdir()] if MODELS_DIR.exists() else [],
        "mode":             "notebook_predictions" if PREDS_PATH.exists() else "live_fpl_api_fallback",
        "instructions": (
            "Model and predictions found — fully operational."
            if MODEL_PATH.exists() and PREDS_PATH.exists()
            else
            "⚠ Run FPL_Pipeline_Fixed.ipynb to generate fpl_model.pkl and "
            "player_predictions.csv. Until then, the app uses live FPL API "
            "form stats as a fallback for player rankings."
        ),
    }


@app.get("/api/current-gw")
def current_gw():
    """Returns the real current Premier League gameweek from the FPL API."""
    try:
        r       = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/", timeout=10).json()
        events  = pd.DataFrame(r["events"])
        current = events[events["is_current"] == True]
        if len(current):
            gw = int(current["id"].iloc[0])
        else:
            finished = events[events["finished"] == True]
            gw = int(finished["id"].max()) if len(finished) else 1
        return {"gameweek": gw}
    except Exception as e:
        raise HTTPException(500, f"Could not fetch current gameweek: {e}")


@app.get("/api/players")
def get_players(
    position:       Optional[str] = None,
    max_price:      float         = 15.0,
    only_available: bool          = True,
    limit:          int           = 50,
):
    df = get_predictions().copy()
    if position:
        df = df[df["position"] == position.upper()]
    df = df[df["price"] <= max_price]
    if only_available:
        df = df[df["status"] == "a"]
    df = df.sort_values("predicted_pts", ascending=False).head(limit)

    # Always return avg_pts_last3 and avg_xgi_last3 (may be approximated)
    cols = ["player_id", "web_name", "team_name", "position",
            "price", "predicted_pts", "status", "avg_pts_last3", "avg_xgi_last3"]
    cols = [c for c in cols if c in df.columns]
    return df[cols].fillna(0).to_dict(orient="records")


@app.get("/api/model/insights")
def get_model_insights():
    if not MODEL_PATH.exists():
        # Return placeholder insights so the Insights page isn't broken
        placeholder_imp = {f: max(4000 - i*300, 200) for i, f in enumerate(FEATURES)}
        return {
            "model":               "LightGBM (Optuna-tuned)",
            "mae":                 1.021,
            "baseline_mae":        1.563,
            "improvement_pct":     34.7,
            "training_rows":       19069,
            "feature_importances": placeholder_imp,
            "model_comparison": [
                {"model": "Baseline (mean)",               "mae": 1.563, "improvement": "—"},
                {"model": "Linear Regression",             "mae": 1.053, "improvement": "32.6%"},
                {"model": "Random Forest",                 "mae": 1.052, "improvement": "32.7%"},
                {"model": "LightGBM",                      "mae": 1.040, "improvement": "33.5%"},
                {"model": "LightGBM + Fixture Difficulty", "mae": 1.040, "improvement": "33.5%"},
                {"model": "LightGBM Tuned (Optuna)",       "mae": 1.021, "improvement": "34.7%"},
            ],
            "_note": "Model file not found — showing placeholder values. Run the notebook to load real feature importances.",
        }

    model       = get_model()
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

    if len(df) < 15:
        raise HTTPException(400, f"Not enough available players ({len(df)}) to build a squad of 15.")

    squad    = _run_squad_ilp(df, budget_raw)
    starters = squad[squad["is_starter"] == True]
    bench    = squad[squad["is_starter"] == False]
    cols     = ["web_name", "team_name", "position", "price", "predicted_pts", "is_starter"]

    starters_sorted   = starters.sort_values("predicted_pts", ascending=False)
    captain_name      = starters_sorted.iloc[0]["web_name"]
    vice_captain_name = starters_sorted.iloc[1]["web_name"]

    return {
        "total_cost":       round(squad["now_cost"].sum() / 10, 1),
        "predicted_points": round(float(starters["predicted_pts"].sum()), 2),
        "budget_remaining": round(req.budget - squad["now_cost"].sum() / 10, 1),
        "captain":          captain_name,
        "vice_captain":     vice_captain_name,
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
    if cheap_gk:
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

    new_sorted        = new_squad.sort_values("predicted_pts", ascending=False)
    captain_name      = new_sorted.iloc[0]["web_name"]
    vice_captain_name = new_sorted.iloc[1]["web_name"]

    return {
        "transfers_made":  n_in,
        "hits_taken":      hits_taken,
        "points_hit":      hits_taken * req.hit_cost,
        "net_pts_gain":    round(pts_gain - hits_taken * req.hit_cost, 2),
        "captain":         captain_name,
        "vice_captain":    vice_captain_name,
        "transfers_in":    transfers_in[cols].to_dict(orient="records"),
        "transfers_out":   transfers_out[cols].to_dict(orient="records"),
        "new_squad":       new_squad[cols + ["in_current"]].to_dict(orient="records"),
        "gameweek":        squad_data["gameweek"],
        "itb":             round(float(squad_data["itb"]), 1),
    }


# ── FPL News & Fixtures & PL Table ────────────────────────────────────────────

@app.get("/api/fpl/news")
def fpl_news(limit: int = 10):
    """Build a news feed from FPL player injury/news strings."""
    BASE_URL = "https://fantasy.premierleague.com/api"
    try:
        r        = requests.get(f"{BASE_URL}/bootstrap-static/", timeout=10).json()
        elements = pd.DataFrame(r["elements"])
    except Exception as e:
        raise HTTPException(500, f"Could not fetch FPL news: {e}")

    news_df = elements.loc[elements["news"].fillna("").str.len() > 0,
        ["id", "web_name", "news", "news_added", "status"]].copy()
    if news_df.empty:
        return []

    if "news_added" in news_df.columns:
        news_df["news_added"] = pd.to_datetime(news_df["news_added"], errors="coerce")
        news_df = news_df.sort_values("news_added", ascending=False)

    def _cat(row):
        txt = str(row.get("news", "")).lower()
        if any(k in txt for k in ["injury","injured","doubt","doubtful","knock"]):
            return "INJURY"
        return "FPL"

    out = []
    for _, row in news_df.head(limit).iterrows():
        cat   = _cat(row)
        added = row.get("news_added")
        time_lbl = str(added)[:16] if pd.notna(added) else "recent"
        out.append({
            "id":       int(row["id"]),
            "cat":      cat,
            "hot":      cat == "INJURY",
            "icon":     "🩹" if cat == "INJURY" else "📊",
            "headline": f"{row['web_name']}: {row['news']}",
            "time":     time_lbl,
        })
    return out


@app.get("/api/fpl/fixtures")
def fpl_fixtures(event: Optional[int] = None):
    """Return fixtures for the current (or given) gameweek."""
    BASE_URL = "https://fantasy.premierleague.com/api"
    try:
        boot  = requests.get(f"{BASE_URL}/bootstrap-static/", timeout=10).json()
        teams = pd.DataFrame(boot["teams"])
        evts  = pd.DataFrame(boot["events"])
    except Exception as e:
        raise HTTPException(500, f"Could not fetch bootstrap data: {e}")

    gw = event
    if gw is None:
        cur = evts[evts["is_current"] == True]
        gw  = int(cur["id"].iloc[0]) if len(cur) else int(evts[evts["finished"]==True]["id"].max())

    try:
        fixtures = requests.get(f"{BASE_URL}/fixtures/?event={gw}", timeout=10).json()
    except Exception as e:
        raise HTTPException(500, f"Could not fetch fixtures: {e}")

    name_map  = teams.set_index("id")["name"].to_dict()
    short_map = teams.set_index("id")["short_name"].to_dict()
    COLOR_MAP = {
        "ARS":"#EF0107","AVL":"#670E36","BOU":"#DA291C","BRE":"#E30613",
        "BHA":"#0057B8","CHE":"#034694","CRY":"#1B458F","EVE":"#003399",
        "FUL":"#000000","LIV":"#C8102E","MCI":"#6CABDD","MUN":"#DA291C",
        "NEW":"#241F20","NFO":"#DD0000","SOU":"#D71920","TOT":"#132257",
        "WHU":"#7A263A","WOL":"#FDB913",
    }

    items = []
    for fx in fixtures:
        hid = fx["team_h"]; aid = fx["team_a"]
        hs  = short_map.get(hid, "")[:3].upper()
        as_ = short_map.get(aid, "")[:3].upper()
        started  = bool(fx.get("started"))
        finished = bool(fx.get("finished"))
        live     = started and not finished
        upcoming = not started
        min_lbl  = "FT" if finished else ""
        if upcoming and fx.get("kickoff_time"):
            try: min_lbl = pd.to_datetime(fx["kickoff_time"]).strftime("%H:%M")
            except: min_lbl = ""
        items.append({
            "id": fx["id"], "h": name_map.get(hid, hs), "hs": hs,
            "hc": COLOR_MAP.get(hs, "#111827"), "hg": fx.get("team_h_score"),
            "a":  name_map.get(aid, as_),        "as_": as_,
            "ac": COLOR_MAP.get(as_, "#111827"), "ag": fx.get("team_a_score"),
            "min": min_lbl, "live": live, "upcoming": upcoming,
        })
    return items


@app.get("/api/pl/table")
def pl_table():
    """
    Build the real Premier League table by computing W/D/L/GD/Pts
    from every finished FPL fixture. This is the only reliable way —
    the FPL teams endpoint win/draw/loss fields are not real league stats.
    """
    BASE_URL = "https://fantasy.premierleague.com/api"
    try:
        boot     = requests.get(f"{BASE_URL}/bootstrap-static/", timeout=10).json()
        fixtures = requests.get(f"{BASE_URL}/fixtures/",         timeout=10).json()
        teams_df = pd.DataFrame(boot["teams"])
    except Exception as e:
        raise HTTPException(500, f"Could not fetch FPL data: {e}")

    # id → display name mapping
    name_map = {
        "Arsenal":       "Arsenal",       "Aston Villa":  "Aston Villa",
        "Bournemouth":   "Bournemouth",   "Brentford":    "Brentford",
        "Brighton":      "Brighton",      "Chelsea":      "Chelsea",
        "Crystal Palace":"Crystal Palace","Everton":      "Everton",
        "Fulham":        "Fulham",        "Ipswich":      "Ipswich",
        "Leicester":     "Leicester",     "Liverpool":    "Liverpool",
        "Man City":      "Man City",      "Man Utd":      "Man United",
        "Newcastle":     "Newcastle",     "Nott'm Forest":"Nottm Forest",
        "Southampton":   "Southampton",   "Spurs":        "Tottenham",
        "West Ham":      "West Ham",      "Wolves":       "Wolves",
    }
    id_to_name = {
        int(row["id"]): name_map.get(str(row["name"]), str(row["name"]))
        for _, row in teams_df.iterrows()
    }

    # Initialise table
    table = {
        tid: {"name": id_to_name.get(tid, str(tid)),
              "played": 0, "win": 0, "draw": 0, "loss": 0,
              "gf": 0, "ga": 0, "gd": 0, "points": 0}
        for tid in id_to_name
    }

    # Process every finished fixture
    for fx in fixtures:
        if not fx.get("finished"):
            continue
        h_id = fx.get("team_h")
        a_id = fx.get("team_a")
        hg   = fx.get("team_h_score")
        ag   = fx.get("team_a_score")
        if h_id not in table or a_id not in table:
            continue
        if hg is None or ag is None:
            continue
        hg, ag = int(hg), int(ag)

        for tid, gf, ga in [(h_id, hg, ag), (a_id, ag, hg)]:
            t = table[tid]
            t["played"] += 1
            t["gf"]     += gf
            t["ga"]     += ga
            t["gd"]     += gf - ga
            if gf > ga:
                t["win"]    += 1
                t["points"] += 3
            elif gf == ga:
                t["draw"]   += 1
                t["points"] += 1
            else:
                t["loss"]   += 1

    # Sort: pts desc, gd desc, gf desc
    ranked = sorted(
        table.values(),
        key=lambda x: (-x["points"], -x["gd"], -x["gf"])
    )
    for i, row in enumerate(ranked):
        row["position"] = i + 1

    return ranked