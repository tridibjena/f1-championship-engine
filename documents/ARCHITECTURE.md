# Project Architecture

## Overview
The F1 2026 Championship Engine is a full-stack simulation platform designed to predict race outcomes and track telemetry data using historical priors and real-time modeling.

## Components
1. **Frontend (Next.js)**: Responsible for visualization, user interaction, and client-side Monte Carlo simulations.
2. **Backend (FastAPI)**: Handles heavy data ingestion (FastF1 API), simulation offloading, and database interactions.
3. **Tracking (MLflow)**: Manages experiment logs and model performance metrics.
4. **Data Layer (PostgreSQL)**: Persists race results, driver ratings, and historical telemetry snapshots.

## Key Workflows
- **Simulation**: Triggered from the UI, processed via `SimProvider.tsx`.
- **Telemetry**: Fetched via the FastAPI `/data/telemetry` endpoint.
- **Standings**: Calculated dynamically from verified race results in `lib/api.ts`.
