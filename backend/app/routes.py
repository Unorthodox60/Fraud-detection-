from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import numpy as np
import random
import time

from . import models, database
from .ml_service import ml_service

router = APIRouter()

@router.post("/predict")
def predict_transaction(transaction: models.TransactionInput, db: Session = Depends(database.get_db)):
    try:
        # Get ML prediction
        prediction = ml_service.predict(transaction)
        
        # Save to DB
        db_log = models.TransactionLog(
            amount=transaction.Amount,
            fraud_probability=prediction.fraud_probability,
            risk_level=prediction.risk_level,
            is_simulated=False
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        return {
            "prediction": prediction,
            "transaction_id": db_log.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_random_transaction(is_fraud: bool) -> models.TransactionInput:
    """Helper to generate a random transaction for simulation."""
    if is_fraud:
        amount = float(np.random.lognormal(mean=5, sigma=2))
        v_features = np.random.normal(loc=2, scale=3, size=28)
    else:
        amount = float(np.random.lognormal(mean=3, sigma=1.5))
        v_features = np.random.normal(loc=0, scale=1, size=28)

    t_dict = {"Time": float(np.random.uniform(0, 172792)), "Amount": amount}
    for i in range(1, 29):
        t_dict[f"V{i}"] = float(v_features[i-1])
        
    return models.TransactionInput(**t_dict)

@router.post("/transactions/simulate")
def simulate_transactions(count: int = 5, fraud_rate: float = 0.2, db: Session = Depends(database.get_db)):
    """Simulates a stream of transactions."""
    results = []
    for _ in range(count):
        is_fraud = random.random() < fraud_rate
        transaction = generate_random_transaction(is_fraud)
        
        # Predict
        prediction = ml_service.predict(transaction)
        
        # Save
        db_log = models.TransactionLog(
            amount=transaction.Amount,
            fraud_probability=prediction.fraud_probability,
            risk_level=prediction.risk_level,
            is_simulated=True
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        results.append({
            "id": db_log.id,
            "timestamp": db_log.timestamp,
            "amount": transaction.Amount,
            "fraud_probability": prediction.fraud_probability,
            "risk_level": prediction.risk_level,
            "top_features": prediction.top_features
        })
        time.sleep(0.1) # Small delay to simulate stream
        
    return {"message": f"Simulated {count} transactions", "data": results}

@router.get("/transactions/recent", response_model=List[models.TransactionResponse])
def get_recent_transactions(limit: int = 50, db: Session = Depends(database.get_db)):
    transactions = db.query(models.TransactionLog).order_by(models.TransactionLog.timestamp.desc()).limit(limit).all()
    return transactions

@router.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    total = db.query(models.TransactionLog).count()
    if total == 0:
        return {"total_transactions": 0, "flagged_count": 0, "fraud_rate": 0.0}
        
    flagged = db.query(models.TransactionLog).filter(
        models.TransactionLog.risk_level.in_(["Medium", "High"])
    ).count()
    
    return {
        "total_transactions": total,
        "flagged_count": flagged,
        "fraud_rate": round(flagged / total, 4) if total > 0 else 0
    }
