from fastapi import APIRouter, HTTPException
import fastf1
import pandas as pd
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/data", tags=["data"])

# Enable caching to speed up subsequent requests
# In a local environment, this will create a 'cache' folder in the api directory
if not os.path.exists("cache"):
    os.makedirs("cache")
fastf1.cache.enable_cache("cache")

@router.get("/results/{year}/{round_num}")
def get_race_results(year: int, round_num: int):
    """
    Fetch full race results for a specific year and round.
    """
    try:
        session = fastf1.get_session(year, round_num, 'R')
        session.load(laps=False, telemetry=False, weather=False, messages=False)
        
        results = session.results
        data = []
        for _, row in results.iterrows():
            data.append({
                "pos": int(row['Position']),
                "driverId": row['DriverId'],
                "driverCode": row['Abbreviation'],
                "team": row['TeamName'],
                "status": row['Status'],
                "points": float(row['Points']),
                "grid": int(row['GridPosition'])
            })
        
        return {
            "year": year,
            "round": round_num,
            "raceName": session.event['EventName'],
            "results": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/telemetry/{year}/{round_num}/{driver_code}")
def get_telemetry(year: int, round_num: int, driver_code: str):
    """
    Fetch telemetry for the fastest lap of a driver.
    """
    try:
        session = fastf1.get_session(year, round_num, 'R')
        session.load()
        
        laps = session.laps.pick_driver(driver_code)
        fastest_lap = laps.pick_fastest()
        telemetry = fastest_lap.get_telemetry()
        
        # Sample the telemetry to keep payload size reasonable
        sampled = telemetry.iloc[::10, :] # Every 10th point
        
        data = []
        for _, row in sampled.iterrows():
            data.append({
                "time": float(row['Time'].total_seconds()),
                "speed": float(row['Speed']),
                "throttle": float(row['Throttle']),
                "brake": float(row['Brake']),
                "gear": int(row['Gear']),
                "rpm": int(row['RPM'])
            })
            
        return {
            "driver": driver_code,
            "lap_time": float(fastest_lap['LapTime'].total_seconds()),
            "telemetry": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standings/{year}")
def get_standings(year: int):
    """
    Fetch current championship standings.
    Note: FastF1 doesn't have a direct 'standings' endpoint like Ergast,
    so we calculate it from results of all completed rounds.
    """
    try:
        # For simplicity in this implementation, we return a mock or simplified calculation
        # Real-world use would iterate through all rounds up to 'latest'
        return {"year": year, "note": "Standings calculation pending full round iteration."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
