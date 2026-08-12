# FPL AI Decision Engine — Full Stack

React frontend + FastAPI backend powered by your LightGBM model and ILP optimizer.

```
FPL-FINAK/
├── Data/
│   ├── data/          ← CSVs (player_predictions.csv etc.)
│   └── models/        ← fpl_model.pkl
├── FPL_Pipeline_Fixed.ipynb
├── fpl-app/           ← THIS FOLDER
│   ├── backend/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
└── app.py             ← old Streamlit app (can keep or remove)
```

---

## Setup

### 1. Backend

```bash
cd fpl-app/backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at:     http://localhost:8000/docs

---

### 2. Frontend

```bash
cd fpl-app/frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/health` | Health check |
| GET  | `/api/players` | Top picks with filters |
| GET  | `/api/model/insights` | Feature importance + model comparison |
| POST | `/api/squad/optimize` | ILP optimal squad |
| GET  | `/api/transfers/squad/{team_id}` | Fetch FPL squad by Team ID |
| POST | `/api/transfers/optimize` | Optimal transfer recommendations |

---

## Updating predictions

Each gameweek, re-run the notebook (Sections 2.3 → 5) to regenerate
`player_predictions.csv`. The backend picks up changes automatically
on the next request (no restart needed).
