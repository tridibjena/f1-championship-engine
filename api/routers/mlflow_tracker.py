from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
import mlflow
import os
import time

router = APIRouter(prefix="/track", tags=["mlflow"])

# Ensure MLflow tracking URI is set (local file by default)
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment("F1_Championship_Simulations")

class SimRunData(BaseModel):
    params: Dict[str, Any]
    metrics: Dict[str, float]
    top_drivers: List[Dict[str, Any]]
    timestamp: float

@router.post("/sim")
async def track_simulation(data: SimRunData):
    try:
        with mlflow.start_run():
            # Log all parameters
            mlflow.log_params(data.params)
            
            # Log key metrics
            mlflow.log_metrics(data.metrics)
            
            # Log top drivers as a tag or JSON artifact
            drivers_summary = ", ".join([f"{d['code']}: {d['prob']:.1%}" for d in data.top_drivers[:5]])
            mlflow.set_tag("top_drivers", drivers_summary)
            mlflow.set_tag("engine_version", "Ensemble-V2-MonteCarlo")
            
            run_id = mlflow.active_run().info.run_id
            
        return {"status": "success", "run_id": run_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_run_history():
    try:
        # Fetch last 10 runs from the experiment
        experiment = mlflow.get_experiment_by_name("F1_Championship_Simulations")
        if not experiment:
            return []
            
        runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id], max_results=15)
        # Convert pandas dataframe to dict
        return runs.to_dict(orient="records")
    except Exception as e:
        print(f"MLflow history fetch error: {e}")
        return []
