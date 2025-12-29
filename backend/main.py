from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

from .schemas import ForecastRequest, ForecastResponse
from .meteo import get_tomorrow_weather
from .pv_model import run_pv_model


app = FastAPI(title="PV Day Ahead Forecast")

# ===== PERCORSO FRONTEND =====
BACKEND_DIR = Path(__file__).parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

# ===== MOUNT STATIC FILES =====
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")
else:
    print(f"⚠️  ATTENZIONE: Cartella frontend non trovata in {FRONTEND_DIR}")

# ===== ROOT ROUTE =====
@app.get("/")
async def serve_index():
    """Serve index.html al root"""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path, media_type="text/html")
    else:
        return {"error": "index.html non trovato in " + str(FRONTEND_DIR)}

# ===== HEALTH CHECK =====
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# ===== API FORECAST =====
@app.post("/api/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest):
    """Calcola la previsione fotovoltaica per domani"""
    
    weather = get_tomorrow_weather(req.lat, req.lon)

    print(f"📅 Previsione per: {weather.index[0].date()}")
    print(f"📊 Dati meteo: {weather.shape[0]} ore")
    
    hourly_power, energy, advanced_metrics = run_pv_model(
        weather=weather,
        lat=req.lat,
        lon=req.lon,
        power_kwp=req.power_kwp,
        tilt=req.tilt,
        azimuth=req.azimuth,
        losses=req.losses,
        # Parametri avanzati modulo
        module_type=req.module_type,
        module_efficiency=req.module_efficiency,
        temp_coeff=req.temp_coeff,
        noct=req.noct,
        # Parametri avanzati sistema
        dc_losses=req.dc_losses,
        ac_losses=req.ac_losses,
        mismatch_losses=req.mismatch_losses,
        soiling_losses=req.soiling_losses,
        inverter_efficiency=req.inverter_efficiency,
        albedo=req.albedo
    )

    # ✨ Estrai data della previsione
    forecast_date = weather.index[0].strftime("%Y-%m-%d")

    return {
        "date": forecast_date,
        "energy_kwh": round(energy, 2),
        "hourly": hourly_power,
        "advanced_metrics": advanced_metrics,
        "meta": {
            "location": [req.lat, req.lon],
            "model": "pvlib + open-meteo",
            "module_type": req.module_type,
            "albedo": req.albedo
        }
    }