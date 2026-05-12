from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.routers import simulation, data, mlflow_tracker
import uvicorn
import os

app = FastAPI(
    title="F1 Championship Engine API",
    description="Backend for F1 2026 Simulation Platform",
    version="1.0.0"
)

app.include_router(simulation.router)
app.include_router(data.router)
app.include_router(mlflow_tracker.router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "f1-engine-api"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "components": {"database": "ok", "mlflow": "pending"}}

# Stub route for running a season simulation
class SimParams(BaseModel):
    mc: int = 2000
    noise: float = 1.0
    elo_w: float = 0.55
    sc_mult: float = 1.0

@app.post("/simulate/season")
def simulate_season(params: SimParams):
    """
    Placeholder for the Python-based simulation runner.
    In the final architecture, heavy Monte Carlo workloads
    will be offloaded here to leverage multithreading/numba.
    """
    # For now, we return a mock response
    return {
        "status": "success",
        "message": f"Simulation requested with {params.mc} runs.",
        "runs": params.mc
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
