from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="PortsPilot AI - Port Operations Backend Engine",
    description=(
        "Competition-grade backend for the Logistics & Ports Container Congestion "
        "Predictor and Port Operations Optimiser. Features 72h queuing congestion prediction, "
        "BAP/CAP berth and crane optimization, alternate routing intelligence, and shift planning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows frontend running on Vite (5173) or any local dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "service": "PortsPilot AI Operations Engine",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "status": "/api/status",
            "forecast": "/api/forecast/congestion",
            "optimize": "/api/optimize",
            "routes": "/api/routes/alternate",
            "planner": "/api/planner/shifts",
            "simulate": "/api/simulation",
            "vessels": "/api/vessels",
            "berths": "/api/berths",
            "cranes": "/api/cranes"
        }
    }

@app.get("/healthz")
def health_check():
    """Health check endpoint for Docker container and Kubernetes/IBM Cloud Code Engine liveness probes."""
    return {"status": "healthy", "service": "portspilot-backend"}
