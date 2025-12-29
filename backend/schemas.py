from pydantic import BaseModel, Field
from typing import List, Optional

class ForecastRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    power_kwp: float = Field(..., gt=0)
    tilt: int = Field(..., ge=0, le=90)
    azimuth: int = Field(..., ge=0, le=360)
    
    # Parametri base
    losses: float = Field(0.14, ge=0, le=0.5, description="Perdite totali aggregate (0-1)")
    
    # Parametri avanzati - Modulo
    module_type: str = Field("mono_standard", description="Tipo tecnologia: mono_premium, mono_standard, poly, thin_film")
    module_efficiency: Optional[float] = Field(None, ge=0.10, le=0.25, description="Efficienza modulo (override)")
    temp_coeff: Optional[float] = Field(None, ge=-0.006, le=-0.002, description="Coefficiente temperatura %/°C (override)")
    noct: Optional[float] = Field(None, ge=40, le=50, description="NOCT °C (override)")
    
    # Parametri avanzati - Sistema
    dc_losses: float = Field(0.02, ge=0, le=0.10, description="Perdite DC cabling")
    ac_losses: float = Field(0.01, ge=0, le=0.05, description="Perdite AC cabling")
    mismatch_losses: float = Field(0.02, ge=0, le=0.05, description="Perdite mismatch")
    soiling_losses: float = Field(0.02, ge=0, le=0.10, description="Perdite sporcizia")
    inverter_efficiency: float = Field(0.97, ge=0.90, le=0.99, description="Efficienza inverter")
    
    # Albedo
    albedo: float = Field(0.20, ge=0.10, le=0.80, description="Albedo terreno")


class HourlyData(BaseModel):
    hour: str
    power_kw: float
    temp: float
    cloud_cover: int
    wind_speed: float
    poa: float
    cell_temp: Optional[float] = None  # Temperatura celle


class AdvancedMetrics(BaseModel):
    performance_ratio: float = Field(..., description="Performance Ratio (%)")
    capacity_factor: float = Field(..., description="Capacity Factor (%)")
    specific_yield: float = Field(..., description="kWh/kWp")
    avg_cell_temp: float = Field(..., description="Temperatura media celle (°C)")
    max_cell_temp: float = Field(..., description="Temperatura massima celle (°C)")
    total_losses_applied: float = Field(..., description="Perdite totali effettive (%)")


class ForecastResponse(BaseModel):
    date: str = Field(..., description="Data previsione (YYYY-MM-DD)")
    energy_kwh: float
    hourly: List[HourlyData]
    advanced_metrics: AdvancedMetrics
    meta: dict