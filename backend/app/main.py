from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database, routes

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="FraudShield AI API",
    description="Backend API for real-time financial fraud detection.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all. In prod, specify frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FraudShield AI API. Go to /docs for the API documentation."}
