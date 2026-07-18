import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import xgboost as xgb
from imblearn.over_sampling import SMOTE

import warnings
warnings.filterwarnings('ignore')

def main():
    # 1. Load Data
    try:
        df = pd.read_csv('creditcard.csv')
        print(f"Loaded real dataset with {len(df)} samples.")
    except FileNotFoundError:
        print("Error: creditcard.csv not found!")
        print("Please place the CSV file at backend/ml/creditcard.csv and run again.")
        return
    
    X = df.drop('Class', axis=1)
    y = df['Class']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Training distribution:\n{y_train.value_counts()}")
    
    # 2. SMOTE for class imbalance
    print("\nApplying SMOTE...")
    smote = SMOTE(random_state=42)
    X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
    print(f"Post-SMOTE training distribution:\n{y_train_smote.value_counts()}")
    
    # 3. Baseline: Random Forest
    print("\n--- Training Random Forest Baseline ---")
    rf_clf = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    rf_clf.fit(X_train_smote, y_train_smote)
    
    y_pred_rf = rf_clf.predict(X_test)
    y_prob_rf = rf_clf.predict_proba(X_test)[:, 1]
    
    print("Random Forest Results:")
    print(classification_report(y_test, y_pred_rf))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob_rf):.4f}")
    
    # 4. XGBoost Classifier
    print("\n--- Training XGBoost Classifier ---")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=100, 
        max_depth=5, 
        learning_rate=0.1, 
        eval_metric='logloss',
        random_state=42,
        use_label_encoder=False
    )
    xgb_clf.fit(X_train_smote, y_train_smote)
    
    y_pred_xgb = xgb_clf.predict(X_test)
    y_prob_xgb = xgb_clf.predict_proba(X_test)[:, 1]
    
    print("XGBoost Results:")
    print(classification_report(y_test, y_pred_xgb))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob_xgb):.4f}")
    
    # 5. Native Feature Importances instead of SHAP due to compatibility
    print("\nGenerating Explainer (Feature Importances)...")
    # Instead of SHAP, we save the feature names and their importance to mock the explainability
    explainer = {
        'feature_names': df.drop('Class', axis=1).columns.tolist(),
        'importances': xgb_clf.feature_importances_
    }
    
    # Save the models
    print("\nSaving XGBoost model and explainer...")
    joblib.dump(xgb_clf, 'model.pkl')
    joblib.dump(explainer, 'explainer.pkl')
    
    # Also save a sample for the frontend testing
    sample = X_test[y_test == 1].iloc[0]
    sample.to_json('sample_fraud.json')
    print("Saved a sample fraud transaction to sample_fraud.json")

if __name__ == '__main__':
    main()
