# FraudShield AI — Full Project Summary

This document is a complete overview of the **FraudShield AI** project. It covers the project goal, full technology stack, folder structure, every file's purpose, the machine learning pipeline, and how data flows through the system.

---

## What is This Project?

**FraudShield AI** is a full-stack, AI-powered application for detecting financial fraud in real time.

It works like this:
1. A financial transaction comes in (either simulated or manually entered).
2. A trained Machine Learning model analyzes its features (amount, time, anonymized PCA features V1–V28).
3. The model outputs a **fraud probability** (0.0 – 1.0) and a **risk level** (Low / Medium / High).
4. The top features that drove the prediction are explained (via feature importance).
5. All results are shown on a live React dashboard and saved to a database.

---

## Full Technology Stack

### Backend (Python)
| Technology | Role |
|---|---|
| **FastAPI** | Web API framework. Handles HTTP requests/responses. |
| **Uvicorn** | ASGI server that runs the FastAPI app. |
| **SQLAlchemy** | ORM (Object Relational Mapper) to talk to the database. |
| **SQLite** | Lightweight database stored in `fraudshield.db`. Logs every transaction. |
| **Pydantic** | Data validation and type safety for API request/response models. |
| **Joblib** | Saves and loads the trained ML model (`model.pkl`) and explainer (`explainer.pkl`). |

### Machine Learning (Python)
| Technology | Role |
|---|---|
| **NumPy** | Numerical arrays and math operations. |
| **Pandas** | Creating DataFrames from transaction data to feed into the model. |
| **scikit-learn** | `RandomForestClassifier` (used as a baseline), `train_test_split`, `classification_report`. |
| **XGBoost** | The main, final fraud detection model (`XGBClassifier`). Better accuracy than Random Forest. |
| **imbalanced-learn (SMOTE)** | Fixes the class imbalance problem — in real data, only ~1% of transactions are fraud. SMOTE synthetically creates more fraud examples during training. |
| **SHAP** | Was intended for explainability (showing why a prediction was made), but had compatibility issues. Replaced with a simpler feature-importance heuristic. |

### Frontend (TypeScript / React)
| Technology | Role |
|---|---|
| **React 19** | UI component library. |
| **TypeScript** | Type-safe JavaScript. |
| **Vite** | Fast build tool and dev server. |
| **TailwindCSS v4** | Utility-first CSS framework for styling. |
| **Recharts** | Charting library for the real-time fraud probability chart on the dashboard. |
| **Axios** | HTTP client for making API calls from the frontend to the FastAPI backend. |
| **Lucide React** | Icon library. |

---

## Folder & File Structure

```
fraudshield-ai/
├── README.md                      ← Project setup instructions & architecture overview
│
├── backend/
│   ├── requirements.txt           ← All Python dependencies to install via pip
│   ├── model.pkl                  ← Saved, trained XGBoost model (binary file)
│   ├── explainer.pkl              ← Saved feature names + importances (binary file)
│   ├── fraudshield.db             ← SQLite database (stores transaction history)
│   ├── sample_fraud.json          ← A sample fraud transaction (for frontend testing)
│   │
│   ├── app/                       ← The FastAPI application package
│   │   ├── main.py                ← App entry point. Creates FastAPI app, sets up CORS, includes routes.
│   │   ├── database.py            ← SQLAlchemy DB connection setup (engine, session, Base)
│   │   ├── models.py              ← Data models: DB table (SQLAlchemy) + API schemas (Pydantic)
│   │   ├── routes.py              ← All API endpoint definitions (predict, simulate, stats, etc.)
│   │   └── ml_service.py         ← Loads model.pkl, runs predictions, calculates feature contributions
│   │
│   └── ml/
│       └── train.py               ← ML training script: generates data, trains models, saves .pkl files
│
└── frontend/
    ├── package.json               ← Node.js dependencies and scripts
    ├── vite.config.ts             ← Vite build configuration
    ├── index.html                 ← Root HTML file (entry point for Vite)
    │
    └── src/
        ├── main.tsx               ← React entry point. Mounts <App /> to the DOM.
        ├── App.tsx                ← Root component. Composes the page: Dashboard + LiveFeed + ManualTestForm
        ├── App.css                ← Global component-level styles
        ├── index.css              ← Global base styles (Tailwind imports)
        │
        ├── services/
        │   └── api.ts             ← All Axios API call functions (predict, simulate, getStats, getRecent)
        │
        └── components/
            ├── Dashboard.tsx      ← Shows stats cards (total, flagged, fraud rate) + Recharts line chart
            ├── LiveFeed.tsx       ← Table of recent transactions with risk-level color coding
            └── ManualTestForm.tsx ← Form to manually enter transaction fields and get a prediction
```

---

## The Machine Learning Pipeline (train.py)

This script is run **once** to train and save the model. It does NOT run on every request.

### Step 1: Generate Synthetic Data
- Creates 20,000 fake credit card transactions (real datasets like Kaggle's are private).
- **Legitimate transactions**: Amount from a log-normal distribution (mean=3), PCA features (V1–V28) from a standard normal distribution.
- **Fraudulent transactions** (2% of total): Amount from a higher log-normal distribution (mean=5), V features shifted to mean=2 to make them distinguishable.
- Each row has columns: `Time, V1, V2, ..., V28, Amount, Class` (where `Class=1` means fraud).

### Step 2: Handle Class Imbalance with SMOTE
- Only 2% of rows are fraud — if you train directly on this, the model learns to just always predict "not fraud" and gets 98% accuracy but misses all actual fraud.
- **SMOTE** (Synthetic Minority Oversampling Technique) generates artificial fraud examples so the model sees a 50/50 split during training.

### Step 3: Train a Baseline (Random Forest)
- A `RandomForestClassifier` with 50 trees is trained and evaluated.
- Results are printed (Precision, Recall, F1, ROC-AUC) for comparison.

### Step 4: Train the Final Model (XGBoost)
- An `XGBClassifier` with 100 estimators, max depth 5, learning rate 0.1 is trained.
- XGBoost consistently outperforms Random Forest on structured tabular data.
- **Approximate performance**: Precision ~0.97, Recall ~0.90, F1 ~0.93, ROC-AUC ~0.99.

### Step 5: Save Models
- `model.pkl` — the trained XGBoost classifier.
- `explainer.pkl` — a dictionary with `feature_names` (list of column names) and `importances` (XGBoost's built-in feature importance scores).
- `sample_fraud.json` — one fraud transaction from the test set, saved for manual frontend testing.

---

## Backend API (routes.py)

The backend exposes 4 API endpoints on `http://localhost:8000`:

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/predict` | Takes a full transaction (Time, Amount, V1–V28) as JSON, runs the ML model, saves to DB, returns fraud probability + risk level + top features. |
| `POST` | `/transactions/simulate` | Generates N random transactions (with a configurable fraud rate), runs predictions on all of them, saves to DB, returns results. Used for the "Live Stream" feature. |
| `GET` | `/transactions/recent` | Returns the last 50 transactions from the DB, ordered by newest first. |
| `GET` | `/stats` | Returns aggregate stats: total transactions, how many were flagged (Medium or High risk), and the overall fraud rate. |

---

## ML Service (ml_service.py)

This file is a Python class (`MLService`) that is instantiated **once** when the server starts up (singleton pattern).

**What it does:**
1. Loads `model.pkl` and `explainer.pkl` from disk using `joblib`.
2. When `predict()` is called with a transaction:
   - Converts the Pydantic model to a Pandas DataFrame.
   - Reorders columns to match the training data order.
   - Calls `model.predict_proba()` to get the fraud probability.
   - Assigns a risk level: less than 0.2 = Low, 0.2-0.7 = Medium, greater than 0.7 = High.
   - Calculates the top 3 most influential features by multiplying feature importance x feature value.
   - Returns a `PredictionResult` Pydantic object.

---

## Data Models (models.py)

There are 4 data models:

| Model | Type | Purpose |
|---|---|---|
| `TransactionLog` | SQLAlchemy (DB Table) | Stores each processed transaction: id, timestamp, amount, fraud_probability, risk_level, is_simulated. |
| `TransactionInput` | Pydantic (API Schema) | Validates incoming transaction data. Has 31 fields: Time, Amount, V1–V28. |
| `PredictionResult` | Pydantic (API Schema) | Shape of the ML prediction output: fraud_probability, risk_level, top_features dict. |
| `TransactionResponse` | Pydantic (API Schema) | Shape of data returned when fetching transaction history from the DB. |

---

## Frontend Components

### App.tsx
- The root layout. Renders the header and composes all three main components: Dashboard, LiveFeed, and ManualTestForm.
- Contains the "Start/Stop Live Stream" button that calls the simulate API on a repeating timer.

### Dashboard.tsx
- Displays 3 summary stat cards: Total Transactions, Flagged Transactions, and Fraud Rate.
- Contains a Recharts LineChart that plots fraud probability over time as new transactions come in.

### LiveFeed.tsx
- A live-updating table of recent transactions.
- Each row shows: Transaction ID, amount, fraud probability (as a %), risk level (color coded: green=Low, yellow=Medium, red=High), and top features that triggered the alert.

### ManualTestForm.tsx
- A form with input fields for every transaction feature (Time, Amount, V1–V28).
- On submit, it calls POST /predict and displays the result inline.
- Pre-fills with example values to make testing easy.

### api.ts (Service)
- Centralizes all API calls using Axios with a base URL of http://localhost:8000.
- Functions: `predictTransaction()`, `simulateTransactions()`, `getRecentTransactions()`, `getStats()`.

---

## How Data Flows End-to-End

```
User Action (clicks "Start Live Stream" or submits form)
  -> Frontend (React) calls api.ts
    -> Axios sends HTTP POST/GET to FastAPI backend (localhost:8000)
      -> routes.py receives the request
        -> ml_service.py loads the transaction into a DataFrame
          -> model.pkl (XGBoost) runs predict_proba()
            -> Returns fraud_probability + risk_level + top_features
          -> SQLAlchemy saves result to fraudshield.db (SQLite)
        -> routes.py returns JSON response
      -> Frontend receives prediction
    -> Dashboard / LiveFeed updates with new data (Recharts re-renders)
```

---

## Key Design Decisions & Limitations

- **Synthetic Data**: The model is trained on artificially generated data, not real credit card transactions. It mimics the structure of the Kaggle Credit Card Fraud Dataset (V1–V28 PCA features) but the relationships are simplified.
- **SHAP replaced with Feature Importance**: SHAP (a proper ML explainability library) had installation/compatibility issues with Python 3.14. The `explainer.pkl` instead stores raw XGBoost feature importances, and the "explanation" shown in the UI is a heuristic approximation.
- **SQLite**: Used for simplicity. In a production system, this would be replaced with PostgreSQL or another production database.
- **No Authentication**: The API has no auth. Anyone with the URL can call it.
- **CORS**: The backend allows all origins so the frontend on localhost:5173 can call the backend on localhost:8000.
