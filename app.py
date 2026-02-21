import streamlit as st
import pandas as pd
import numpy as np
import requests
import joblib
import pulp
import matplotlib.pyplot as plt
from pathlib import Path

st.set_page_config(page_title="FPL AI Decision Engine", layout="wide")
st.title("⚽ FPL AI Decision Engine")
st.markdown("LightGBM-powered player predictions and optimal team selection via Integer Linear Programming")

# ── CONFIGURATION ─────────────────────────────────────────────────────────────
# Point DATA_DIR and MODELS_DIR at your actual folders.
# Example (Windows):
#   DATA_DIR   = Path(r"E:\Fpl-Hackathon\Data")
#   MODELS_DIR = Path(r"E:\Fpl-Hackathon\Models")
#
# By default the app looks for data/ and models/ next to this script.
BASE_DIR   = Path(__file__).resolve().parent
DATA_DIR   = BASE_DIR / "Data" / "data"
MODELS_DIR = BASE_DIR / "Data" / "models"
# ─────────────────────────────────────────────────────────────────────────────

MODEL_PATH       = MODELS_DIR / "fpl_model.pkl"
PREDICTIONS_PATH = DATA_DIR   / "player_predictions.csv"
VALIDATION_CHART = DATA_DIR   / "validation_chart.png"

FEATURES = [
    'avg_pts_last3', 'avg_pts_last5', 'form_trend',
    'avg_minutes_last3', 'avg_xgi_last3', 'avg_ict_last3',
    'avg_bps_last3', 'is_home', 'value', 'avg_fixture_difficulty'
]

# ── DATA LOADING ──────────────────────────────────────────────────────────────
def _missing_file_msg(path):
    return (
        f"**File not found:** `{path}`\n\n"
        "Edit the two lines near the top of `fpl_app.py`:\n"
        "```python\n"
        "DATA_DIR   = Path(r'C:\\your\\path\\Data')\n"
        "MODELS_DIR = Path(r'C:\\your\\path\\Models')\n"
        "```\n"
        "Save the file — Streamlit reloads automatically."
    )


@st.cache_resource
def load_model():
    if not MODEL_PATH.exists():
        st.error(_missing_file_msg(MODEL_PATH))
        st.stop()
    return joblib.load(MODEL_PATH)


@st.cache_data(ttl=3600)
def load_data():
    if not PREDICTIONS_PATH.exists():
        st.error(_missing_file_msg(PREDICTIONS_PATH))
        st.stop()

    df = pd.read_csv(PREDICTIONS_PATH)

    r       = requests.get('https://fantasy.premierleague.com/api/bootstrap-static/').json()
    teams   = pd.DataFrame(r['teams'])
    players = pd.DataFrame(r['elements'])[['id', 'status']]

    team_map = teams.set_index('id')['name'].to_dict()
    pos_map  = {1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD'}

    df['team_name'] = df['team'].map(team_map)
    df['position']  = df['element_type'].map(pos_map)
    df['price']     = df['now_cost'] / 10

    status_map  = players.set_index('id')['status'].to_dict()
    df['status'] = df['player_id'].map(status_map)

    return df


model = load_model()
df    = load_data()

# ── SIDEBAR ───────────────────────────────────────────────────────────────────
st.sidebar.header("⚙️ Filters")
pos_options       = ['GK', 'DEF', 'MID', 'FWD']
selected_positions = st.sidebar.multiselect("Position", pos_options, default=pos_options)
max_price          = st.sidebar.slider("Max Price (£m)", 4.0, 15.0, 15.0)
only_available     = st.sidebar.checkbox("Only available players", value=True)

filtered = df[df['position'].isin(selected_positions)]
filtered = filtered[filtered['price'] <= max_price]
if only_available:
    filtered = filtered[filtered['status'] == 'a']

# ── TABS ──────────────────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs([
    "🏆 Top Picks",
    "📊 Model Insights",
    "🤖 Optimal Squad",
    "🔄 Transfer Planner",
])

# ══ TAB 1: TOP PICKS ══════════════════════════════════════════════════════════
with tab1:
    st.subheader("Top Player Recommendations")
    st.caption(
        "LightGBM model | MAE: 1.021 pts | "
        "Trained on 19,069 gameweek records | Features include fixture difficulty"
    )

    display = filtered[['web_name', 'team_name', 'position', 'price', 'predicted_pts']].copy()
    display.columns = ['Player', 'Team', 'Position', 'Price (£m)', 'Predicted Pts']
    display = display.sort_values('Predicted Pts', ascending=False).head(20)

    st.dataframe(
        display.style.background_gradient(cmap='Greens', subset=['Predicted Pts']),
        use_container_width=True,
        hide_index=True,
    )

# ══ TAB 2: MODEL INSIGHTS ═════════════════════════════════════════════════════
with tab2:
    st.subheader("Model Performance & Feature Importance")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Model",                    "LightGBM (Tuned)")
    col2.metric("Model MAE",                "1.021 pts")
    col3.metric("Baseline MAE",             "1.563 pts")
    col4.metric("Improvement vs Baseline",  "34.7%")

    st.divider()

    st.markdown("#### Feature Importance")
    importances = pd.Series(model.feature_importances_, index=FEATURES).sort_values(ascending=True)

    fig, ax = plt.subplots(figsize=(8, 4))
    importances.plot(kind='barh', ax=ax, color='steelblue')
    ax.set_title('Feature Importance — LightGBM (Tuned)')
    ax.set_xlabel('Importance Score')
    plt.tight_layout()
    st.pyplot(fig)

    st.info(
        "**Key insight:** Minutes played is the strongest predictor — "
        "availability matters more than raw talent for FPL points. "
        "Fixture difficulty is included as a forward-looking feature."
    )

    st.divider()

    st.markdown("#### Model Comparison")
    comparison = pd.DataFrame({
        'Model': [
            'Baseline (mean)',
            'Linear Regression',
            'Random Forest',
            'LightGBM',
            'LightGBM + Fixture Difficulty',
            'LightGBM Tuned (Optuna)',
        ],
        'MAE': [1.563, 1.053, 1.052, 1.040, 1.040, 1.021],
        'Improvement vs Baseline': ['—', '32.6%', '32.7%', '33.5%', '33.5%', '34.7%'],
    })
    st.dataframe(comparison, use_container_width=True, hide_index=True)

    st.divider()

    st.markdown("#### Predicted vs Actual Validation")
    if VALIDATION_CHART.exists():
        st.image(str(VALIDATION_CHART))
        st.caption("Overall validation MAE: 0.754 across 5 unseen gameweeks")
    else:
        st.warning(f"Validation chart not found at `{VALIDATION_CHART.resolve()}`. Run the notebook to generate it.")

# ══ TAB 3: OPTIMAL SQUAD ══════════════════════════════════════════════════════
with tab3:
    st.subheader("ILP Optimal Squad Selector")
    st.caption("Integer Linear Programming — selects full 15-man squad then picks best starting 11")

    col_a, col_b = st.columns(2)
    with col_a:
        budget = st.slider("Budget (£m)", 80.0, 100.0, 100.0, step=0.5)
    with col_b:
        st.markdown("**Constraints applied:**")
        st.markdown(
            "- 15-man squad: 2 GK, 5 DEF, 5 MID, 3 FWD\n"
            "- Starting 11: 1 GK, 3-5 DEF, 3-5 MID, 1-3 FWD\n"
            "- Max 3 per club\n"
            "- Backup GK capped at £4.0m\n"
            "- 3 cheap outfield bench players (≤£5.0m)"
        )

    if st.button("🚀 Generate Optimal Squad", type="primary"):
        with st.spinner("Running ILP optimizer..."):

            opt_df     = df[df['status'] == 'a'].copy().reset_index(drop=True)
            n          = len(opt_df)
            budget_raw = int(budget * 10)

            # Phase 1 — 15-man squad
            prob = pulp.LpProblem("FPL_Squad", pulp.LpMaximize)
            x    = [pulp.LpVariable(f"x{i}", cat='Binary') for i in range(n)]

            prob += pulp.lpSum(opt_df['predicted_pts'][i] * x[i] for i in range(n))
            prob += pulp.lpSum(x) == 15
            prob += pulp.lpSum(opt_df['now_cost'][i] * x[i] for i in range(n)) <= budget_raw

            for pos, mn, mx in [('GK',2,2),('DEF',5,5),('MID',5,5),('FWD',3,3)]:
                idx = opt_df[opt_df['position'] == pos].index.tolist()
                prob += pulp.lpSum(x[i] for i in idx) >= mn
                prob += pulp.lpSum(x[i] for i in idx) <= mx

            for team_id in opt_df['team'].unique():
                idx = opt_df[opt_df['team'] == team_id].index.tolist()
                prob += pulp.lpSum(x[i] for i in idx) <= 3

            cheap_outfield = opt_df[(opt_df['now_cost'] <= 50) & (opt_df['position'] != 'GK')].index.tolist()
            prob += pulp.lpSum(x[i] for i in cheap_outfield) >= 3

            cheap_gk = opt_df[(opt_df['now_cost'] <= 40) & (opt_df['position'] == 'GK')].index.tolist()
            prob += pulp.lpSum(x[i] for i in cheap_gk) >= 1

            prob.solve(pulp.PULP_CBC_CMD(msg=0))
            squad = opt_df[[x[i].value() == 1 for i in range(n)]].copy().reset_index(drop=True)

            # Phase 2 — best starting 11
            m     = len(squad)
            prob2 = pulp.LpProblem("FPL_Starting11", pulp.LpMaximize)
            y     = [pulp.LpVariable(f"y{i}", cat='Binary') for i in range(m)]

            prob2 += pulp.lpSum(squad['predicted_pts'][i] * y[i] for i in range(m))
            prob2 += pulp.lpSum(y) == 11

            for pos, mn, mx in [('GK',1,1),('DEF',3,5),('MID',3,5),('FWD',1,3)]:
                idx = squad[squad['position'] == pos].index.tolist()
                prob2 += pulp.lpSum(y[i] for i in idx) >= mn
                prob2 += pulp.lpSum(y[i] for i in idx) <= mx

            prob2.solve(pulp.PULP_CBC_CMD(msg=0))
            squad['is_starter'] = [y[i].value() == 1 for i in range(m)]

        starters   = squad[squad['is_starter'] == True]
        bench      = squad[squad['is_starter'] == False]
        total_cost = squad['now_cost'].sum() / 10
        total_pts  = starters['predicted_pts'].sum()

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Squad Size",                "15 players")
        col2.metric("Total Cost",                f"£{total_cost:.1f}m")
        col3.metric("Budget Remaining",          f"£{budget - total_cost:.1f}m")
        col4.metric("Starting 11 Predicted Pts", f"{total_pts:.1f}")

        st.divider()
        st.markdown("### ⚡ Starting 11")
        for pos in ['GK', 'DEF', 'MID', 'FWD']:
            pos_players = starters[starters['position'] == pos][
                ['web_name', 'team_name', 'price', 'predicted_pts']
            ].copy()
            pos_players.columns = ['Player', 'Team', 'Price (£m)', 'Predicted Pts']
            if len(pos_players) > 0:
                st.markdown(f"**{pos}**")
                st.dataframe(
                    pos_players.style.background_gradient(cmap='Greens', subset=['Predicted Pts']),
                    use_container_width=True,
                    hide_index=True,
                )

        st.divider()
        st.markdown("### 🪑 Bench (4)")
        bench_display = bench[['web_name', 'team_name', 'position', 'price', 'predicted_pts']].copy()
        bench_display.columns = ['Player', 'Team', 'Position', 'Price (£m)', 'Predicted Pts']
        st.dataframe(
            bench_display.style.background_gradient(cmap='Blues', subset=['Predicted Pts']),
            use_container_width=True,
            hide_index=True,
        )

# ══ TAB 4: TRANSFER PLANNER ═══════════════════════════════════════════════════
with tab4:
    st.subheader("Transfer Planner")
    st.caption(
        "Enter your FPL Team ID and the optimizer will fetch your squad automatically, "
        "then find the best transfers accounting for hits."
    )

    # ── Step 1: Fetch squad from FPL API ──────────────────────────────────────
    @st.cache_data(ttl=300, show_spinner=False)
    def fetch_fpl_squad(team_id: int):
        """
        Returns (player_ids, current_gw, itb_float, free_transfers_int)
        Uses bootstrap-static events to reliably detect the current GW,
        with fallback to entry's current_event field.
        """
        BASE = "https://fantasy.premierleague.com/api"

        # ── 1. Detect current GW via bootstrap-static ─────────────────────
        boot = requests.get(f"{BASE}/bootstrap-static/").json()
        events_df = pd.DataFrame(boot["events"])

        # Prefer is_current flag; fall back to highest finished event
        current_rows = events_df[events_df["is_current"] == True]
        if len(current_rows):
            current_gw = int(current_rows["id"].iloc[0])
        else:
            finished = events_df[events_df["finished"] == True]
            if len(finished):
                current_gw = int(finished["id"].max())
            else:
                # Season not started — use GW 1
                current_gw = 1

        # ── 2. Entry info (bank, current_event as sanity check) ───────────
        entry_r    = requests.get(f"{BASE}/entry/{team_id}/").json()
        if "detail" in entry_r:
            raise ValueError(f"Team ID {team_id} not found. Please double-check your Team ID.")

        # entry.current_event is the last GW the manager submitted picks for
        entry_gw   = entry_r.get("current_event") or current_gw
        # Use whichever is lower — avoids requesting a GW that has no picks yet
        picks_gw   = min(current_gw, entry_gw)

        itb = entry_r.get("last_deadline_bank", 0) / 10  # £m

        # ── 3. Fetch picks — try picks_gw, fall back to picks_gw-1 ───────
        picks_r = None
        for gw_try in [picks_gw, picks_gw - 1, picks_gw + 1]:
            if gw_try < 1:
                continue
            url = f"{BASE}/entry/{team_id}/event/{gw_try}/picks/"
            resp = requests.get(url).json()
            if "picks" in resp:
                picks_r    = resp
                current_gw = gw_try
                break

        if picks_r is None:
            raise ValueError(
                f"Could not retrieve picks for Team ID {team_id} "
                f"(tried GW {picks_gw-1}–{picks_gw+1}). "
                "Make sure you have made your picks for this gameweek."
            )

        player_ids = [p["element"] for p in picks_r["picks"]]

        # ── 4. Free transfers from entry transfers endpoint ───────────────
        trans_r = requests.get(f"{BASE}/entry/{team_id}/transfers/").json()
        free_tf = 1
        if isinstance(trans_r, list) and len(trans_r):
            # Most recent transfer record holds free_transfers for next GW
            free_tf = trans_r[0].get("event_transfers_cost", 0)
            # event_transfers_cost < 0 means they have banked transfers — default 1
            free_tf = max(1, free_tf)
        # Simpler: check entry summary directly
        free_tf = entry_r.get("last_deadline_free_transfers", 1) or 1

        return player_ids, current_gw, itb, int(free_tf)

    # ── UI ────────────────────────────────────────────────────────────────────
    col_id, col_settings = st.columns([1, 1])

    with col_id:
        st.markdown("**Step 1 — Enter your FPL Team ID**")
        st.caption(
            "Find it in the URL when you visit your team page: "
            "`fantasy.premierleague.com/entry/`**`123456`**`/event/26`"
        )
        team_id_input = st.number_input(
            "FPL Team ID", min_value=1, max_value=99_999_999, value=1, step=1,
            label_visibility="collapsed"
        )

        fetch_clicked = st.button("📥 Load My Squad", use_container_width=True)

        squad_player_ids = []
        fetched_itb      = 0.0
        fetched_ft       = 1

        if fetch_clicked:
            with st.spinner("Fetching your squad from FPL..."):
                try:
                    squad_player_ids, gw, fetched_itb, fetched_ft = fetch_fpl_squad(int(team_id_input))
                    st.session_state["squad_ids"] = squad_player_ids
                    st.session_state["fetched_itb"] = fetched_itb
                    st.session_state["fetched_ft"]  = fetched_ft
                    st.success(f"✅ Squad loaded for GW {gw} — {len(squad_player_ids)} players found")
                except Exception as e:
                    st.error(f"Could not load squad: {e}. Check your Team ID and try again.")

        # Show fetched squad names if available
        if "squad_ids" in st.session_state and st.session_state["squad_ids"]:
            fetched_df = df[df["player_id"].isin(st.session_state["squad_ids"])][
                ["web_name", "team_name", "position", "price", "predicted_pts"]
            ].copy()
            fetched_df.columns = ["Player", "Team", "Pos", "Price (£m)", "Pred Pts"]
            st.markdown("**Your current squad:**")
            st.dataframe(fetched_df.sort_values("Pos"), use_container_width=True, hide_index=True)

    with col_settings:
        st.markdown("**Step 2 — Transfer settings**")
        free_transfers = st.number_input(
            "Free transfers",
            min_value=1, max_value=5,
            value=int(st.session_state.get("fetched_ft", 1))
        )
        hit_cost   = st.number_input("Points hit per extra transfer", min_value=1, max_value=8, value=4)
        budget_itb = st.number_input(
            "Money in the bank (£m)",
            min_value=0.0, max_value=20.0,
            value=float(st.session_state.get("fetched_itb", 0.0)),
            step=0.1
        )
        st.markdown("**Constraints applied:**")
        st.markdown(
            "- Max 3 players per club\n"
            "- Position limits maintained\n"
            "- Hit deducted from objective\n"
            "- Budget = squad selling price + ITB"
        )

    st.divider()

    # ── Step 3: Run optimizer ─────────────────────────────────────────────────
    run_disabled = "squad_ids" not in st.session_state or not st.session_state["squad_ids"]
    if run_disabled:
        st.info("👆 Load your squad first using your Team ID above.")

    if st.button("🔄 Find Best Transfers", type="primary", disabled=run_disabled):
        squad_ids        = st.session_state["squad_ids"]
        current_squad_df = df[df["player_id"].isin(squad_ids)]

        if len(current_squad_df) < 11:
            st.error(f"Only matched {len(current_squad_df)} players in the predictions data. "
                     "Try regenerating player_predictions.csv from the notebook.")
        else:
            # ── Budget: selling price of current squad + money in the bank ──
            # FPL selling price = buy price if no gain, or buy price + 50% of gain.
            # We approximate using now_cost (close enough for planning purposes).
            squad_sell_value = current_squad_df["now_cost"].sum() / 10
            total_budget_raw = int((squad_sell_value + budget_itb) * 10)

            # ── Build candidate pool: available players + keep current squad
            # even if injured (you can't force-remove an injured player via the
            # optimizer — the user decides). Mark current squad members.
            opt_df = df.copy().reset_index(drop=True)
            opt_df["in_current"] = opt_df["player_id"].isin(squad_ids).astype(int)

            # Only consider available players OR already in the squad
            opt_df = opt_df[(opt_df["status"] == "a") | (opt_df["in_current"] == 1)].reset_index(drop=True)
            n = len(opt_df)

            with st.spinner("Running transfer ILP optimizer..."):
                prob = pulp.LpProblem("FPL_Transfers", pulp.LpMaximize)

                # x[i] = 1 if player i is in the NEW squad
                # t[i] = 1 if player i is a transfer IN (new arrival)
                # s[i] = 1 if player i is transferred OUT (sold)
                # h    = number of HITS (transfers beyond free allocation)
                x = [pulp.LpVariable(f"x{i}", cat="Binary") for i in range(n)]
                t = [pulp.LpVariable(f"t{i}", cat="Binary") for i in range(n)]
                s = [pulp.LpVariable(f"s{i}", cat="Binary") for i in range(n)]
                h = pulp.LpVariable("hits", lowBound=0, cat="Continuous")

                # Objective: maximise predicted pts minus hit penalty
                prob += pulp.lpSum(opt_df["predicted_pts"][i] * x[i] for i in range(n)) - hit_cost * h

                # ── Hard constraints ────────────────────────────────────────
                # Squad size = 15
                prob += pulp.lpSum(x) == 15

                # Budget: cost of new squad ≤ total available funds
                prob += pulp.lpSum(opt_df["now_cost"][i] * x[i] for i in range(n)) <= total_budget_raw

                # Position quotas (full squad)
                for pos, mn, mx in [("GK",2,2),("DEF",5,5),("MID",5,5),("FWD",3,3)]:
                    idx = opt_df[opt_df["position"] == pos].index.tolist()
                    prob += pulp.lpSum(x[i] for i in idx) >= mn
                    prob += pulp.lpSum(x[i] for i in idx) <= mx

                # Max 3 per club
                for club in opt_df["team"].unique():
                    idx = opt_df[opt_df["team"] == club].index.tolist()
                    prob += pulp.lpSum(x[i] for i in idx) <= 3

                # Backup GK ≤ £4.0m
                cheap_gk = opt_df[(opt_df["now_cost"] <= 40) & (opt_df["position"] == "GK")].index.tolist()
                prob += pulp.lpSum(x[i] for i in cheap_gk) >= 1

                # ── Transfer tracking ───────────────────────────────────────
                # t[i] = 1  iff  player is NEW to the squad (x=1, was not in current)
                # s[i] = 1  iff  player is SOLD        (x=0, was in current)
                for i in range(n):
                    ic = opt_df["in_current"][i]
                    # Transfer IN indicator
                    prob += t[i] >= x[i] - ic       # forced 1 if selected and new
                    prob += t[i] <= x[i]             # can't be 1 if not selected
                    prob += t[i] <= 1 - ic           # can't be 1 if already owned

                    # Transfer OUT indicator
                    prob += s[i] >= ic - x[i]        # forced 1 if owned and dropped
                    prob += s[i] <= ic               # can't sell what you don't own
                    prob += s[i] <= 1 - x[i]         # can't sell if still selected

                # Transfers in == transfers out (squad size stays 15)
                prob += pulp.lpSum(t) == pulp.lpSum(s)

                # Hits = max(0, transfers_in - free_transfers)
                prob += h >= pulp.lpSum(t) - free_transfers

                prob.solve(pulp.PULP_CBC_CMD(msg=0))

                # ── Parse results ───────────────────────────────────────────
                new_squad    = opt_df[[x[i].value() == 1 for i in range(n)]].copy()
                transfers_in  = new_squad[new_squad["in_current"] == 0]
                out_ids       = [pid for pid in squad_ids if pid not in new_squad["player_id"].values]
                transfers_out = df[df["player_id"].isin(out_ids)]
                n_in          = len(transfers_in)
                hits_taken    = max(0, n_in - free_transfers)
                net_hit_pts   = hits_taken * hit_cost

            # ── Results ───────────────────────────────────────────────────────
            pts_gain = transfers_in["predicted_pts"].sum() - transfers_out["predicted_pts"].sum()

            col1, col2, col3, col4 = st.columns(4)
            col1.metric("Transfers Made",           n_in)
            col2.metric("Hits Taken",               hits_taken)
            col3.metric("Points Hit",               f"-{net_hit_pts}" if net_hit_pts else "0")
            col4.metric("Net Pts Gain (after hit)", f"{pts_gain - net_hit_pts:+.2f}")

            st.divider()

            if n_in == 0:
                st.success("✅ No transfers recommended — keep your current squad this week.")
            else:
                col_out, col_in = st.columns(2)
                with col_out:
                    st.markdown("### ❌ Transfer Out")
                    out_display = transfers_out[["web_name","team_name","position","price","predicted_pts"]].copy()
                    out_display.columns = ["Player","Team","Pos","Price (£m)","Pred Pts"]
                    st.dataframe(
                        out_display.style.background_gradient(cmap="Reds", subset=["Pred Pts"]),
                        use_container_width=True, hide_index=True,
                    )
                with col_in:
                    st.markdown("### ✅ Transfer In")
                    in_display = transfers_in[["web_name","team_name","position","price","predicted_pts"]].copy()
                    in_display.columns = ["Player","Team","Pos","Price (£m)","Pred Pts"]
                    st.dataframe(
                        in_display.style.background_gradient(cmap="Greens", subset=["Pred Pts"]),
                        use_container_width=True, hide_index=True,
                    )

                st.divider()
                st.markdown("### 📋 Full New Squad")
                new_display = new_squad[["web_name","team_name","position","price","predicted_pts","in_current"]].copy()
                new_display["in_current"] = new_display["in_current"].map({1: "✅ Kept", 0: "🆕 New"})
                new_display.columns = ["Player","Team","Pos","Price (£m)","Pred Pts","Status"]
                new_display = new_display.sort_values(["Pos","Pred Pts"], ascending=[True, False])
                st.dataframe(new_display, use_container_width=True, hide_index=True)