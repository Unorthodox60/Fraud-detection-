# FraudShield AI - Real-Time Financial Fraud Detection

FraudShield AI is a full-stack, AI-powered financial fraud detection system designed to analyze transactions in real-time, flag potential fraud using machine learning, and provide explainable risk assessments.

## Architecture Diagram

- **Frontend**: React + Vite + TypeScript, styled with TailwindCSS v4. Provides a real-time Recharts dashboard and a Live Feed of incoming transactions.
- **Backend API**: FastAPI (Python). Exposes endpoints to run predictions, simulate streaming transactions, and fetch historical stats. Backed by SQLite for transaction logging.
- **Machine Learning**: 
  - **Data**: Trained on real Kaggle Credit Card Fraud Detection dataset — 284,807 transactions from European cardholders (2013). Features: Time, Amount, V1-V28 PCA-transformed, Class.
  - **Imbalance Handling**: SMOTE (Synthetic Minority Over-sampling Technique).
  - **Model**: Random Forest won on real data.
  - **Explainability**: Feature importance using model's built-in feature_importances_ (SHAP had Python 3.14 compatibility issues — documented as known limitation)

## Model Performance Metrics

| Model | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|
| Logistic Regression | 0.11 | 0.90 | 0.20 | 0.97 |
| Random Forest ✅ | 0.83 | 0.83 | 0.83 | 0.99 |
| XGBoost | 0.40 | 0.89 | 0.55 | 0.98 |
| SVM | Removed | — | — | — |

*(Note: SVM removed — quadratic time complexity was infeasible on 570,000 rows post-SMOTE)*

## Setup Instructions

### 1. Backend & ML Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Run the ML pipeline to generate data, train the model, and save `.pkl` files:
   ```bash
   python ml/train.py
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API will be available at http://localhost:8000/docs*

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at the URL provided in the terminal (usually http://localhost:5173).*

## Features

- **Live Simulation**: Click "Start Live Stream" to simulate incoming transactions.
- **Feature Importance**: Hover over or view high-risk transactions to see the exact PCA features that triggered the alert.
- **Manual Testing**: Input your own parameters in the "Manual Transaction Test" form to see how the model reacts.
