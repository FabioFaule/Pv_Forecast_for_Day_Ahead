import pvlib
import numpy as np
import pandas as pd

# ===== PRESET TECNOLOGIE MODULI =====
MODULE_PRESETS = {
    "mono_premium": {
        "efficiency": 0.22,
        "temp_coeff": -0.0038,  # -0.38%/°C
        "noct": 43
    },
    "mono_standard": {
        "efficiency": 0.20,
        "temp_coeff": -0.0040,  # -0.40%/°C
        "noct": 45
    },
    "poly": {
        "efficiency": 0.17,
        "temp_coeff": -0.0043,  # -0.43%/°C
        "noct": 46
    },
    "thin_film": {
        "efficiency": 0.15,
        "temp_coeff": -0.0025,  # -0.25%/°C (CdTe)
        "noct": 47
    }
}

def pvgis_to_pvlib_azimuth(azimuth_pvgis):
    return (azimuth_pvgis + 180) % 360



def calculate_system_losses(dc_losses, ac_losses, mismatch_losses, soiling_losses, inverter_efficiency):
    """
    Calcola le perdite totali del sistema come prodotto dei singoli fattori.
    Ogni perdita è in formato 0-1 (es. 0.02 = 2%).
    """
    total_factor = (1 - dc_losses) * (1 - ac_losses) * (1 - mismatch_losses) * (1 - soiling_losses) * inverter_efficiency
    total_losses = 1 - total_factor
    return total_losses


def run_pv_model(
    weather, 
    lat, 
    lon, 
    power_kwp, 
    tilt, 
    azimuth, 
    losses=None,  # Deprecato, ora calcolato da parametri avanzati
    module_type="mono_standard",
    module_efficiency=None,
    temp_coeff=None,
    noct=None,
    dc_losses=0.02,
    ac_losses=0.01,
    mismatch_losses=0.02,
    soiling_losses=0.02,
    inverter_efficiency=0.97,
    albedo=0.20
):
    """
    Calcola il profilo orario e l'energia giornaliera di un impianto fotovoltaico.
    
    Parametri:
        weather: pd.DataFrame con colonne ['temp', 'cloud_cover', 'wspd'] e indice DatetimeIndex UTC
        lat, lon: coordinate
        power_kwp: potenza nominale impianto (kWp)
        tilt, azimuth: orientamento pannelli
        module_type: tipo tecnologia modulo
        module_efficiency, temp_coeff, noct: override parametri modulo
        dc_losses, ac_losses, mismatch_losses, soiling_losses: perdite individuali
        inverter_efficiency: efficienza inverter
        albedo: riflettività terreno
    """

    # ===== 1. PARAMETRI MODULO =====
    preset = MODULE_PRESETS.get(module_type, MODULE_PRESETS["mono_standard"])
    
    eta = module_efficiency if module_efficiency is not None else preset["efficiency"]
    gamma = temp_coeff if temp_coeff is not None else preset["temp_coeff"]
    noct_val = noct if noct is not None else preset["noct"]
    
    # Calcola perdite totali se losses non è fornito
    if losses is None:
        total_losses = calculate_system_losses(
            dc_losses, ac_losses, mismatch_losses, soiling_losses, inverter_efficiency
        )
    else:
        total_losses = losses

    # ===== 2. TIMEZONE =====
    if weather.index.tz is None:
        times = weather.index.tz_localize('UTC')
    else:
        times = weather.index.tz_convert('UTC')

    azimuth_pvlib = pvgis_to_pvlib_azimuth(azimuth)


    # ===== 3. POSIZIONE SOLARE =====
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)

    # ===== 4. CLEAR-SKY GHI =====
    location = pvlib.location.Location(lat, lon)
    clearsky = location.get_clearsky(times, model='ineichen')
    ghi_clear = clearsky["ghi"]

    # ===== 5. GHI EFFETTIVO DA CLOUD COVER =====
    a, b = 0.75, 1.3
    C = weather["cloud_cover"].clip(0, 1)
    kt = 1 - a * (C ** b)
    ghi = kt * ghi_clear
    ghi = ghi.clip(lower=0)

    # ===== 6. DECOMPOSIZIONE ERBS (DNI/DHI) =====
    dni_dhi = pvlib.irradiance.erbs(ghi, solpos["zenith"], times)
    dni = dni_dhi["dni"]
    dhi = dni_dhi["dhi"]

    # ===== 7. IRRAGGIAMENTO SU PIANO PANNELLO (POA) =====
    dni_extra = pvlib.irradiance.get_extra_radiation(times)
    poa_components = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=azimuth_pvlib,
        solar_zenith=solpos["zenith"],
        solar_azimuth=solpos["azimuth"],
        dni=dni,
        ghi=ghi,
        dhi=dhi,
        dni_extra=dni_extra,
        albedo=albedo,  # ✨ Nuovo parametro
        model="perez"
    )
    poa = poa_components["poa_global"]

    # ===== 8. TEMPERATURA CELLE (NOCT) =====
    temp_air = weather["temp"].fillna(20)
    wind_speed = weather["wspd"].fillna(1)
    t_cell = pvlib.temperature.noct_sam(
        poa_global=poa,
        temp_air=temp_air,
        wind_speed=wind_speed,
        noct=noct_val,
        module_efficiency=eta
    )

    # ===== 9. MODELLO ELETTRICO =====
    power = power_kwp * (poa / 1000) * (1 + gamma * (t_cell - 25)) * (1 - total_losses)
    power = power.clip(lower=0)

    # ===== 10. ENERGIA GIORNALIERA =====
    energy = power.sum()

    # ===== 11. METRICHE AVANZATE =====
    # Performance Ratio (PR)
    theoretical_energy = power_kwp * (ghi.sum() / 1000)  # Energia teorica con GHI
    pr = (energy / theoretical_energy * 100) if theoretical_energy > 0 else 0
    
    # Capacity Factor
    max_possible = power_kwp * 24
    cf = (energy / max_possible * 100) if max_possible > 0 else 0
    
    # Specific Yield
    specific_yield = energy / power_kwp if power_kwp > 0 else 0
    
    # Temperature celle
    productive_hours = t_cell[power > 0.05]
    avg_cell_temp = float(productive_hours.mean()) if len(productive_hours) > 0 else 0
    max_cell_temp = float(t_cell.max())

    advanced_metrics = {
        "performance_ratio": round(pr, 1),
        "capacity_factor": round(cf, 1),
        "specific_yield": round(specific_yield, 2),
        "avg_cell_temp": round(avg_cell_temp, 1),
        "max_cell_temp": round(max_cell_temp, 1),
        "total_losses_applied": round(total_losses * 100, 1)
    }

    # ===== 12. PROFILO ORARIO =====
    hourly = []
    for i in range(len(power)):
        hourly.append({
            "hour": power.index[i].strftime("%H:00"),
            "power_kw": round(float(power.iloc[i]), 3),
            "temp": round(float(temp_air.iloc[i]), 1),
            "cloud_cover": int(weather["cloud_cover"].iloc[i] * 100),
            "wind_speed": round(float(wind_speed.iloc[i]), 1),
            "poa": round(float(poa.iloc[i]), 1),
            "cell_temp": round(float(t_cell.iloc[i]), 1)
        })
    
    return hourly, float(energy), advanced_metrics