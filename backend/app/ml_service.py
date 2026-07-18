import joblib
import pandas as pd
import os
import numpy as np
from .models import TransactionInput, PredictionResult

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model.pkl')
EXPLAINER_PATH = os.path.join(os.path.dirname(__file__), '../explainer.pkl')

class MLService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.load_models()

    def load_models(self):
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(EXPLAINER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.explainer = joblib.load(EXPLAINER_PATH)
                print("Models loaded successfully.")
            else:
                print("Warning: Models not found. Please train them first.")
        except Exception as e:
            print(f"Error loading models: {e}")

    def predict(self, transaction: TransactionInput) -> PredictionResult:
        if self.model is None or self.explainer is None:
            self.load_models()
            if self.model is None or self.explainer is None:
                raise RuntimeError("Model is not initialized.")

        # Convert input to DataFrame
        data = transaction.model_dump()
        df = pd.DataFrame([data])
        
        # Ensure correct column order for XGBoost
        df = df[self.explainer['feature_names']]
        
        # Predict probability
        prob = self.model.predict_proba(df)[0][1]
        
        # Determine risk level
        if prob < 0.2:
            risk_level = "Low"
        elif prob < 0.7:
            risk_level = "Medium"
        else:
            risk_level = "High"

        # Explain prediction with Feature Importances (mocking SHAP for the UI)
        # We multiply the raw feature importance by the feature value to give a sense of directional contribution
        feature_names = self.explainer['feature_names']
        importances = self.explainer['importances']
        
        feature_contributions = []
        for i, col in enumerate(feature_names):
            val = df[col].iloc[0]
            # Mock contribution: Importance * (normalized value deviation from 0)
            # This is a very rough heuristic for demo purposes since SHAP failed to install
            contrib = importances[i] * float(val)
            feature_contributions.append((col, abs(contrib)))
            
        feature_contributions.sort(key=lambda x: x[1], reverse=True)
        
        top_features = {k: float(v) for k, v in feature_contributions[:3]}

        return PredictionResult(
            fraud_probability=float(prob),
            risk_level=risk_level,
            top_features=top_features
        )

ml_service = MLService()
