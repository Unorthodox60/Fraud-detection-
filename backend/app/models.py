from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Dict
import datetime
from .database import Base

# SQLAlchemy Model
class TransactionLog(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    amount = Column(Float, nullable=False)
    fraud_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # Low, Medium, High
    is_simulated = Column(Boolean, default=False)

# Pydantic Schemas
class TransactionInput(BaseModel):
    Time: float
    Amount: float
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

class PredictionResult(BaseModel):
    fraud_probability: float
    risk_level: str
    top_features: Dict[str, float]

class TransactionResponse(BaseModel):
    id: int
    timestamp: datetime.datetime
    amount: float
    fraud_probability: float
    risk_level: str
    is_simulated: bool

    class Config:
        from_attributes = True
