# F1 2026 Championship Engine

A high-performance Formula 1 simulation and telemetry platform built with Next.js 16, FastAPI, and MLflow. This engine utilizes Monte Carlo simulations and Glicko-2 ratings to predict the 2026 championship outcome.

## Key Features

- **Monte Carlo Simulations**: Run 5,000+ iterations to predict championship probabilities.
- **FastF1 Telemetry Dashboard**: Real-world lap trace visualization (Speed, Throttle, Brake, Gear) using Recharts.
- **MLflow Experiment Tracking**: Log every simulation run, track hyper-parameters, and monitor model accuracy.
- **Dynamic 2026 Calendar**: Up-to-date schedule including the latest results (e.g., Miami GP).
- **Driver Market Insights**: Bayesian-driven probability analysis for future driver moves.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Recharts, TailwindCSS.
- **Backend**: FastAPI (Python 3.11), FastF1 API.
- **Database**: PostgreSQL.
- **DevOps**: Docker, Docker Compose.
- **Tracking**: MLflow (Port 5050).

## Running the Project

### Prerequisites
- Docker Desktop installed and running.
- Node.js 20+.

### 1. Start Backend Services
Launch the API, Database, and MLflow tracking server:
```bash
docker compose up -d
```

### 2. Start Frontend
Launch the Next.js development server:
```bash
npm run dev
```

## Port Mappings

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | Main UI Dashboard |
| **API** | `http://localhost:8000` | FastAPI Backend & Docs (`/docs`) |
| **MLflow** | `http://localhost:5050` | Experiment Tracking UI |
| **Database** | `localhost:5432` | PostgreSQL Instance |

## Known macOS Issues
- **Port 5000 Conflict**: If you experience an `Access Denied` error, ensure AirPlay Receiver is disabled in System Settings or use the default Port 5050 configured in this repo.

---
*Built for the 2026 Championship Season.*
