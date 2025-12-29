# ☀️ PV Day-Ahead Forecast

> Professional photovoltaic production forecasting web application with advanced solar modeling

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![pvlib](https://img.shields.io/badge/pvlib-0.10+-orange.svg)](https://pvlib-python.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live Demo](#) | [Documentation](#features) | [API Reference](#api-endpoints)**

---

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshots/main-interface.png" alt="Main Interface" width="800"/>
  <p><em>Interactive map-based configuration and real-time forecasting</em></p>
</div>

<div align="center">
  <img src="docs/screenshots/results.png" alt="Forecast Results" width="800"/>
  <p><em>Detailed hourly production curves with weather data</em></p>
</div>

---

## 🎯 Project Overview

This is a **production-grade web application** for forecasting photovoltaic energy production 24 hours ahead. Built as a portfolio project to demonstrate full-stack development skills, it combines:

- **Advanced physics modeling** (pvlib-python)
- **Real-time weather APIs** (Open-Meteo)
- **Modern web architecture** (FastAPI + vanilla JS)
- **Professional UI/UX** with interactive maps and charts

The application is designed to showcase software engineering best practices while solving a real-world problem in renewable energy.

---

## ✨ Features

### Core Functionality
- **📍 Interactive Location Selection**
  - Drag-and-drop map marker (Leaflet)
  - Address search with geocoding (Nominatim API)
  - Manual coordinate input
  
- **⚙️ Configurable System Parameters**
  - Plant capacity (kWp)
  - Panel tilt angle (0-90°)
  - Azimuth orientation with custom values
  - Advanced loss modeling (DC/AC cables, mismatch, soiling)
  
- **🔬 Professional Solar Modeling**
  - Perez transposition model for POA irradiance
  - NOCT cell temperature model
  - Erbs decomposition (DNI/DHI from GHI)
  - Multiple module technology presets (mono/poly/thin-film)

### Advanced Features
- **📊 Comprehensive Metrics**
  - Performance Ratio (PR)
  - Capacity Factor
  - Specific Yield (kWh/kWp)
  - Cell temperature tracking
  
- **🌤️ Weather Integration**
  - Hourly temperature, cloud cover, wind speed
  - Plane-of-array (POA) irradiance calculation
  - Visual weather summary cards
  
- **📈 Interactive Visualizations**
  - Hourly production curve (Chart.js)
  - Detailed weather table
  - Real-time metrics dashboard

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern async web framework
- **pvlib-python** - Solar energy modeling library
- **Pandas** - Data manipulation
- **Pydantic** - Data validation
- **Open-Meteo API** - Weather forecasts

### Frontend
- **Vanilla JavaScript** - No framework overhead
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **CSS Grid/Flexbox** - Responsive layout

### Why This Stack?
- ✅ **Production-ready**: FastAPI powers major APIs at scale
- ✅ **Scientific accuracy**: pvlib is the industry standard for PV modeling
- ✅ **Lightweight**: No heavy JS framework = faster load times
- ✅ **Maintainable**: Clean architecture with clear separation of concerns

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pv-forecast.git
cd pv-forecast
```

2. **Install dependencies**
```bash
pip install -r backend/requirements.txt
```

3. **Run the application**
```bash
uvicorn backend.main:app --reload
```

4. **Open in browser**
```
http://localhost:8000
```

---

## 📂 Project Structure

```
pv-forecast/
├── backend/
│   ├── __init__.py
│   ├── main.py           # FastAPI app & routes
│   ├── meteo.py          # Weather API integration
│   ├── pv_model.py       # Solar physics calculations
│   ├── schemas.py        # Pydantic models
│   └── requirements.txt
├── frontend/
│   ├── index.html        # Main interface
│   ├── style.css         # Custom styling
│   └── app.js            # Client-side logic
├── docs/
│   └── screenshots/
└── README.md
```

---

## 🔌 API Endpoints

### `POST /api/forecast`

Calculate day-ahead PV production forecast.

**Request Body:**
```json
{
  "lat": 45.4642,
  "lon": 9.1900,
  "power_kwp": 5.5,
  "tilt": 30,
  "azimuth": 0,
  "module_type": "mono_standard",
  "dc_losses": 0.02,
  "ac_losses": 0.01,
  "inverter_efficiency": 0.97,
  "albedo": 0.20
}
```

**Response:**
```json
{
  "date": "2025-12-30",
  "energy_kwh": 18.45,
  "hourly": [
    {
      "hour": "08:00",
      "power_kw": 1.234,
      "temp": 15.2,
      "cloud_cover": 30,
      "poa": 450.5
    }
  ],
  "advanced_metrics": {
    "performance_ratio": 82.5,
    "capacity_factor": 15.8,
    "specific_yield": 3.35
  }
}
```

---

## 🧮 Solar Modeling Details

The application implements state-of-the-art PV modeling:

1. **Weather Data** → Open-Meteo forecast (temperature, clouds, wind)
2. **Clear-Sky GHI** → Ineichen model
3. **Cloud Attenuation** → GHI = clear_sky × (1 - a × cloud^b)
4. **DNI/DHI Decomposition** → Erbs correlation
5. **POA Irradiance** → Perez transposition model
6. **Cell Temperature** → NOCT model with wind cooling
7. **DC Power** → P = P_nom × (POA/1000) × (1 + γ(T_cell - 25))
8. **System Losses** → DC cables, AC cables, mismatch, soiling, inverter

---

## 🎓 Key Learning Outcomes

This project demonstrates:

- **API Design**: RESTful endpoints with proper validation
- **Scientific Computing**: Integration of research-grade libraries
- **Frontend Skills**: Responsive UI without frameworks
- **Data Visualization**: Interactive charts and maps
- **Error Handling**: Robust validation and user feedback
- **Code Organization**: Clean architecture with separation of concerns
- **Documentation**: Professional README and inline comments

---

## 🚧 Future Enhancements

- [ ] Historical production comparison
- [ ] Multi-day forecasts
- [ ] Database integration for user profiles
- [ ] Authentication system
- [ ] Export reports (PDF/CSV)
- [ ] Mobile app (React Native)
- [ ] Machine learning weather corrections
- [ ] Real-time monitoring integration

---

## 📊 Performance Metrics

- **API Response Time**: ~200-500ms (including weather API call)
- **Frontend Load Time**: <1s (no heavy frameworks)
- **Model Accuracy**: ±10-15% vs real production (weather-dependent)
- **Supported Languages**: English, Italian (i18n ready)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Fabio Faule**

- GitHub: [@yourusername](https://github.com/FabioFaule)
- LinkedIn: [Your LinkedIn](www.linkedin.com/in/fabio-faule)

---

## 🙏 Acknowledgments

- **pvlib-python** - Solar modeling library
- **Open-Meteo** - Free weather API
- **FastAPI** - Modern web framework
- **Leaflet** - Interactive maps library

---

## 📧 Contact

For questions or collaboration opportunities:
- 📧 Email: your.email@example.com
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/yourprofile)

---

<div align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
  <br><br>
  Made with ❤️ for the energy transition
</div>
