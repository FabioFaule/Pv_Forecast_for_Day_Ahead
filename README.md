# ☀️ PV Day-Ahead Forecast

> A photovoltaic production forecasting tool built by an energy engineer who loves to code

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![pvlib](https://img.shields.io/badge/pvlib-python-orange.svg)](https://pvlib-python.readthedocs.io/)

**[Live Demo](#) (coming soon)**

---

## 🎯 What This Is

This is a **personal project** I built to combine my background in energy engineering with my passion for programming. As an energy engineer, I work with Python daily and wanted to create a practical tool for PV systems that:

- Forecasts solar production for the next day
- Uses real physics models (not just rough estimates)
- Has a nice UI that non-technical people can actually use
- Helps me learn full-stack web development

**Disclaimer**: I'm not a professional software developer - I'm an engineer who enjoys coding and building things. The code might not follow all best practices, but it works and I'm proud of it! 🚀

---

## 📸 What It Looks Like

<div align="center">
  <img src="docs/screenshots/demo.gif" alt="App Demo" width="800"/>
  <p><em>Interactive interface with map, charts, and weather data</em></p>
</div>

---

## ✨ Features

### What It Does Well
- **📍 Location Selection**: Click on a map or search for an address
- **⚙️ Plant Configuration**: Set your system parameters (power, tilt, orientation)
- **🔬 Physics-Based Modeling**: Uses pvlib (the industry standard library)
- **📊 Detailed Output**: Hourly production curve, weather data, performance metrics
- **🌐 Language**: Italian (English is on the way, I'm working on the double language frontend 😅)

### Advanced Options
- Different module technologies (mono, poly, thin-film)
- Granular loss modeling (DC/AC cables, mismatch, soiling)
- Cell temperature calculations
- Albedo settings for different ground types

---

## 🛠️ Tech Stack

**Backend:**
- **FastAPI** - Because it's modern and has great docs
- **pvlib-python** - The scientific library I use professionally
- **Pandas** - Can't live without it
- **Open-Meteo API** - Free weather data (no API key needed!)

**Frontend:**
- **Vanilla JavaScript** - I'm learning React but started simple
- **Leaflet** - For the interactive map
- **Chart.js** - Makes pretty graphs
- **CSS Grid/Flexbox** - Trial and error until it looked good

**Why These Choices?**
- I knew pvlib was a pretty good and functional library
- FastAPI was easier to learn than others
- Didn't want to overcomplicate with a frontend framework (yet)
- Wanted to focus on the engineering problem, not tooling

---

## 🚀 How to Run It

### Prerequisites
```bash
Python 3.9 or higher
That's it!
```

### Installation

1. **Clone this thing**
```bash
git clone https://github.com/yourusername/pv-forecast.git
cd pv-forecast
```

2. **Install Python packages**
```bash
pip install -r backend/requirements.txt
```

3. **Start the server**
```bash
uvicorn backend.main:app --reload
```

4. **Open your browser**
```
http://localhost:8000
```

That's it! No database, no environment variables, no complicated setup.

---

## 📂 Project Structure

```
pv-forecast/
├── backend/
│   ├── main.py           # API endpoints
│   ├── meteo.py          # Gets weather from Open-Meteo
│   ├── pv_model.py       # The physics magic ✨
│   ├── schemas.py        # Data validation
│   └── requirements.txt
├── frontend/
│   ├── index.html        # The UI
│   ├── style.css         # Made it look decent
│   └── app.js            # Handles user interactions
└── README.md             # You are here!
```

Simple and flat - I like to keep things organized but not over-engineered.

---

## 🧮 How the Solar Model Works

I tried to keep this scientifically accurate while being practical:

1. **Get tomorrow's weather** → Open-Meteo API (temp, clouds, wind)
2. **Calculate clear-sky irradiance** → Ineichen model
3. **Apply cloud cover** → Empirical correlation
4. **Split into direct/diffuse** → Erbs decomposition
5. **Transpose to panel plane** → Perez model (accounts for view angles)
6. **Calculate cell temperature** → NOCT model with wind cooling
7. **Compute DC power** → Temperature-corrected efficiency
8. **Apply system losses** → Cables, inverter, mismatch, dirt

All equations come from pvlib's documentation - I didn't invent anything, just connected the pieces.

---

## 🎓 What I Learned

This project was a great learning experience:

- **FastAPI**: Coming from Flask, the async stuff was confusing at first
- **Frontend JavaScript**: I mostly work in Python, so DOM manipulation was new
- **API design**: Figuring out what data structure makes sense
- **CSS**: Making things responsive is really nice but harder than I thought

**Biggest Challenge**: Getting the timezone handling right, Weather and FastAPIs, user input, and Python PVLIB as I never used it before

---

## 🐛 Known Issues

Being honest about limitations:

- **Weather Accuracy**: Open-Meteo is good but not perfect. Cloud cover can be off.
- **No Historical Data**: Only shows tomorrow's forecast (for now)
- **Mobile UI**: Works okay but could be better
- **No User Accounts**: Everything is client-side, no saved configs
- **Limited Error Messages**: Sometimes fails silently if weather API is down
- **Code Quality**: Some functions are too long, need refactoring

I'm aware of these and working on improvements when I have time!

---

## 🚧 Future Ideas

Things I'd like to add (no promises on timeline):

- [ ] Multi-day forecasts (7 days, 30 days, etc)
- [ ] Provide Energy production based on TMY (PVGIS integration)
- [ ] Consider the horizon
- [ ] Compare forecast vs actual production (need data source)
- [ ] Save favorite locations
- [ ] Export data to CSV/json
- [ ] Maybe a database for user profiles?
- [ ] Learn React and rebuild the frontend properly

---

## 📝 License

MIT License - do whatever you want with this code. If it helps someone, great!

---

## 👤 About Me

**Energy Engineer | Python and ML Enthusiast **

I work in the renewable energy sector and code small tools as a hobby and to make my job easier. I'm comfortable with:
- Python (NumPy, Pandas, pvlib, matplotlib)
- Energy modeling and simulations
- Data analysis and visualization
- Basic web development (still learning!)


**Find me:**
- GitHub: [@yourusername](https://github.com/FabioFaule)
- LinkedIn: [Your Profile](https://linkedin.com/in/fabio-faule)

---

## 🙏 Credits

- **pvlib-python** - Amazing library, great documentation
- **Open-Meteo** - Free weather API that actually works
- **FastAPI community** - Super helpful docs and examples
- 
---

## 📧 Questions?

Feel free to reach out! I'm happy to:
- Explain how something works
- Discuss the solar modeling approach
- Share what I've learned
- Get feedback on my code
  
---

<div align="center">
  <em>"Not perfect, but it works!"</em>
</div>
