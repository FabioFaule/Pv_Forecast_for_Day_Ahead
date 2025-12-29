# ============================================
# METEO.PY - VERSIONE CORRETTA
# ============================================

import requests
import pandas as pd
from datetime import datetime, timedelta, timezone

def get_tomorrow_weather(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": [
            "temperature_2m",
            "cloud_cover",
            "windspeed_10m"
        ],
        "timezone": "UTC"
    }

    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()

    hourly = pd.DataFrame({
        "temp": data["hourly"]["temperature_2m"],
        "cloud_cover": data["hourly"]["cloud_cover"],
        "wspd": data["hourly"]["windspeed_10m"],
    }, index=pd.to_datetime(data["hourly"]["time"], utc=True))

    # Normalizza cloud cover 0–1
    hourly["cloud_cover"] = hourly["cloud_cover"] / 100.0

    # ✅ FIX: Selezione robusta "domani"
    now_utc = datetime.now(timezone.utc)
    tomorrow_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    tomorrow_end = tomorrow_start + timedelta(days=1)
    
    hourly = hourly[(hourly.index >= tomorrow_start) & (hourly.index < tomorrow_end)]

    if hourly.empty:
        raise ValueError(f"Open-Meteo returned empty forecast for {tomorrow_start.date()}")

    return hourly