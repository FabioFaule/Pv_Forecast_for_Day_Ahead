let lat = 45.0;
let lon = 9.0;
let pendingLat = null;
let pendingLon = null;
let chart = null;
let forecastDate = null;





// ===== MAPPA =====
const map = L.map('map').setView([lat, lon], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

const marker = L.marker([lat, lon], { draggable: true }).addTo(map);

document.documentElement.lang = currentLang;


const i18n = {
  it: {
    calc: "Calcola Previsione",
    power: "Potenza",
    location_confirmed: "✓ Posizione confermata",
    invalid_coords: "Coordinate non valide",
    forecast_ok: "Previsione calcolata con successo!",
    cloudy_high: "Molto nuvoloso",
    cloudy_mid: "Parzialmente nuvoloso",
    sunny: "Sereno"
  },
  en: {
    calc: "Calculate Forecast",
    power: "Power",
    location_confirmed: "✓ Position confirmed",
    invalid_coords: "Invalid coordinates",
    forecast_ok: "Forecast calculated successfully!",
    cloudy_high: "Very cloudy",
    cloudy_mid: "Partly cloudy",
    sunny: "Clear"
  }
};

let currentLang = localStorage.getItem("lang") || "it";

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  location.reload();
}


function t(key) {
  return i18n[currentLang][key] || key;
}


function updateMapDisplay() {
  const mapInfo = document.getElementById('map-info');
  const mapCoords = document.getElementById('map-coords');
  const mapStatus = document.getElementById('map-status');
  const mapButtons = document.getElementById('map-buttons');

  if (pendingLat !== null && pendingLon !== null) {
    mapCoords.textContent = `${pendingLat.toFixed(4)}°, ${pendingLon.toFixed(4)}°`;
    mapCoords.style.color = '#f59e0b';
    mapStatus.textContent = '⚠️ Nuova posizione - Conferma per applicare';
    mapInfo.classList.add('pending');
    mapButtons.style.display = 'flex';
    document.getElementById('map').classList.add('dragging');
  } else {
    mapCoords.textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    mapCoords.style.color = 'var(--success)';
    mapStatus.textContent = t("location_confirmed");
    mapInfo.classList.remove('pending');
    mapButtons.style.display = 'none';
    document.getElementById('map').classList.remove('dragging');
  }
}

marker.on('dragend', () => {
  const pos = marker.getLatLng();
  pendingLat = pos.lat;
  pendingLon = pos.lng;
  updateMapDisplay();
  showAlert('🎯 Marker spostato - Clicca Conferma per applicare', 'success');
});

function confirmMapPosition() {
  if (pendingLat !== null && pendingLon !== null) {
    lat = pendingLat;
    lon = pendingLon;
    pendingLat = null;
    pendingLon = null;
    updateMapDisplay();
    showAlert('✓ Posizione confermata!', 'success');
  }
}

function cancelMapPosition() {
  marker.setLatLng([lat, lon]);
  pendingLat = null;
  pendingLon = null;
  updateMapDisplay();
  showAlert('Annullato', 'error');
}

// ===== TABS =====
function switchTab(event, tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// ===== TOGGLE SEZIONE AVANZATA =====
function toggleAdvanced() {
  const content = document.getElementById('advanced-content');
  const btn = document.getElementById('toggle-advanced-btn');
  const icon = btn.querySelector('.toggle-icon');
  
  if (content.style.display === 'none' || !content.style.display) {
    content.style.display = 'block';
    icon.textContent = '▼';
    btn.classList.add('active');
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
    btn.classList.remove('active');
  }
}

// ===== AGGIORNA PERDITE TOTALI =====
function updateTotalLosses() {
  const dc = parseFloat(document.getElementById('dc-losses').value) / 100;
  const ac = parseFloat(document.getElementById('ac-losses').value) / 100;
  const mismatch = parseFloat(document.getElementById('mismatch-losses').value) / 100;
  const soiling = parseFloat(document.getElementById('soiling-losses').value) / 100;
  const inverter = parseFloat(document.getElementById('inverter-eff').value) / 100;
  
  const totalFactor = (1 - dc) * (1 - ac) * (1 - mismatch) * (1 - soiling) * inverter;
  const totalLosses = (1 - totalFactor) * 100;
  
  document.getElementById('total-losses-display').textContent = totalLosses.toFixed(1) + '%';
}

// ===== APPLICA COORDINATE MANUALI =====
function applyManualCoords() {
  const newLat = parseFloat(document.getElementById('manual-lat').value);
  const newLon = parseFloat(document.getElementById('manual-lon').value);

  if (isNaN(newLat) || isNaN(newLon)) {
    showAlert('Inserire coordinate valide', 'error');
    return;
  }

  if (newLat < -90 || newLat > 90 || newLon < -180 || newLon > 180) {
    showAlert('Coordinate fuori dai limiti', 'error');
    return;
  }

  lat = newLat;
  lon = newLon;
  pendingLat = null;
  pendingLon = null;
  marker.setLatLng([lat, lon]);
  map.setView([lat, lon], 10);
  updateMapDisplay();
  showAlert('✓ Coordinate applicate!', 'success');
}

// ===== RICERCA INDIRIZZO =====
async function searchAddress() {
  const address = document.getElementById('address-search').value.trim();

  if (!address) {
    showAlert('Inserire un indirizzo', 'error');
    return;
  }

  const searchBtn = document.getElementById('search-btn');
  const originalText = searchBtn.textContent;
  searchBtn.disabled = true;
  searchBtn.innerHTML = '<span class="spinner"></span>Ricerca...';

  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '<div style="text-align: center; padding: 20px;"><span class="spinner"></span></div>';
  document.getElementById('search-results').style.display = 'block';

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=it`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'PV-App' } }
    );

    const results = await response.json();

    if (results.length === 0) {
      resultsList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Nessun risultato</div>';
      return;
    }

    resultsList.innerHTML = results.map((r) => {
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      return `
        <div class="result-item" onclick="selectAddress(${lat}, ${lon}, '${r.display_name.replace(/'/g, "\\'")}')">
          <div class="result-name">${r.name || r.display_name.split(',')[0]}</div>
          <div class="result-details">${r.display_name.substring(0, 60)}...</div>
          <div class="result-coords">${lat.toFixed(4)}°, ${lon.toFixed(4)}°</div>
        </div>
      `;
    }).join('');

  } catch (err) {
    resultsList.innerHTML = '<div style="color: #fca5a5; text-align: center; padding: 20px;">Errore: ' + err.message + '</div>';
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = originalText;
  }
}

function selectAddress(newLat, newLon, address) {
  lat = newLat;
  lon = newLon;
  pendingLat = null;
  pendingLon = null;
  marker.setLatLng([lat, lon]);
  map.setView([lat, lon], 12);
  updateMapDisplay();

  document.getElementById('selected-address').style.display = 'block';
  document.getElementById('selected-addr-text').textContent = address.substring(0, 80);
  document.getElementById('search-results').style.display = 'none';
  
  showAlert(`✓ Posizione aggiornata`, 'success');
}

// ===== FORMATTA DATA =====
function formatForecastDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('it-IT', options);
}

// ===== DISPLAY WEATHER DATA =====
function displayWeatherData(hourly) {
  const dayHours = hourly.filter(h => {
    const hour = parseInt(h.hour.split(':')[0]);
    return hour >= 8 && hour <= 18;
  });

  if (dayHours.length === 0) {
    console.warn('Nessun dato orario disponibile per le ore diurne');
    return;
  }

  const avgTemp = (dayHours.reduce((a, b) => a + b.temp, 0) / dayHours.length).toFixed(1);
  const minTemp = Math.min(...dayHours.map(h => h.temp)).toFixed(1);
  const maxTemp = Math.max(...dayHours.map(h => h.temp)).toFixed(1);
  
  const avgCloud = (dayHours.reduce((a, b) => a + b.cloud_cover, 0) / dayHours.length).toFixed(0);
  const cloudDesc = avgCloud > 70 ? 'Molto nuvoloso' : avgCloud > 40 ? 'Parzialmente nuvoloso' : 'Sereno';
  
  const avgWind = (dayHours.reduce((a, b) => a + b.wind_speed, 0) / dayHours.length).toFixed(1);
  const maxWind = Math.max(...dayHours.map(h => h.wind_speed)).toFixed(1);
  
  const avgIrradiance = (dayHours.reduce((a, b) => a + b.poa, 0) / dayHours.length).toFixed(0);

  const tempEl = document.getElementById('weather-temp');
  const conditionEl = document.getElementById('weather-condition');
  const windEl = document.getElementById('weather-wind');
  const irradEl = document.getElementById('weather-irrad');
  
  if (tempEl) tempEl.innerHTML = `${avgTemp}<span class="weather-unit">°C</span>`;
  if (conditionEl) conditionEl.textContent = `${avgCloud}%`;
  if (windEl) windEl.innerHTML = `${maxWind}<span class="weather-unit">m/s</span>`;
  if (irradEl) irradEl.textContent = `${avgIrradiance} W/m²`;
  
  const tempDescEl = document.getElementById('weather-temp-desc');
  const conditionDescEl = document.getElementById('weather-condition-desc');
  
  if (tempDescEl) tempDescEl.textContent = `${minTemp}° - ${maxTemp}°`;
  if (conditionDescEl) conditionDescEl.textContent = cloudDesc;

  const cloudIcon = document.getElementById('cloud-icon');
  if (cloudIcon) {
    if (avgCloud < 30) {
      cloudIcon.textContent = '☀️';
    } else if (avgCloud < 70) {
      cloudIcon.textContent = '⛅';
    } else {
      cloudIcon.textContent = '☁️';
    }
  }

  // Tabella Oraria
  const tbody = document.getElementById('weather-hourly-table');
  if (tbody) {
    tbody.innerHTML = hourly.map(h => `
      <tr>
        <td><strong>${h.hour}</strong></td>
        <td>${h.temp.toFixed(1)}°C</td>
        <td>${h.cloud_cover}%</td>
        <td>${h.wind_speed.toFixed(1)} m/s</td>
        <td>${h.poa.toFixed(0)} W/m²</td>
        <td>${h.cell_temp ? h.cell_temp.toFixed(1) + '°C' : '--'}</td>
        <td class="text-primary"><strong>${h.power_kw.toFixed(2)} kW</strong></td>
      </tr>
    `).join('');
  }
}

// ===== DISPLAY METRICHE AVANZATE =====
function displayAdvancedMetrics(metrics) {
  document.getElementById('metric-pr').textContent = metrics.performance_ratio + '%';
  document.getElementById('metric-cf').textContent = metrics.capacity_factor + '%';
  document.getElementById('metric-yield').textContent = metrics.specific_yield + ' kWh/kWp';
  document.getElementById('metric-avg-temp').textContent = metrics.avg_cell_temp + '°C';
  document.getElementById('metric-max-temp').textContent = metrics.max_cell_temp + '°C';
  document.getElementById('metric-losses').textContent = metrics.total_losses_applied + '%';
  
  document.getElementById('advanced-metrics-section').style.display = 'block';
}

// ===== RANGE SLIDERS =====
// ===== RANGE SLIDERS =====
// Sincronizza slider e input per inclinazione
const tiltSlider = document.getElementById('tilt');
const tiltInput = document.getElementById('tilt-input');
const tiltValue = document.getElementById('tilt-value');

tiltSlider.addEventListener('input', (e) => {
  const val = e.target.value;
  tiltValue.textContent = val + '°';
  tiltInput.value = val;
});

tiltInput.addEventListener('input', (e) => {
  let val = parseInt(e.target.value);
  if (isNaN(val)) return;
  val = Math.max(0, Math.min(90, val)); // Clamp 0-90
  tiltSlider.value = val;
  tiltValue.textContent = val + '°';
  e.target.value = val;
});

// Gestione azimuth personalizzato
const azimuthSelect = document.getElementById('azimuth');
const azimuthInput = document.getElementById('azimuth-input');

azimuthSelect.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    azimuthInput.style.display = 'block';
    azimuthInput.focus();
  } else {
    azimuthInput.style.display = 'none';
  }
});

azimuthInput.addEventListener('input', (e) => {
  let val = parseInt(e.target.value);
  if (isNaN(val)) return;
  val = Math.max(0, Math.min(360, val)); // Clamp 0-360
  e.target.value = val;
});

['dc-losses', 'ac-losses', 'mismatch-losses', 'soiling-losses', 'inverter-eff'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', (e) => {
      document.getElementById(id + '-value').textContent = e.target.value + (id === 'inverter-eff' ? '%' : '%');
      updateTotalLosses();
    });
  }
});

// ===== ALERT SYSTEM =====
function showAlert(message, type = 'error') {
  const alertsDiv = document.getElementById('alerts');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertsDiv.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}

// ===== CALCOLO =====
// ===== CALCOLO CON VALIDAZIONE ROBUSTA =====
async function calculate() {
  // Validazione Potenza
  const kwp = parseFloat(document.getElementById('kwp').value);
  if (isNaN(kwp) || kwp <= 0) {
    showAlert('⚠️ Inserire una potenza valida maggiore di 0 kWp', 'error');
    document.getElementById('kwp').focus();
    return;
  }
  if (kwp > 1000) {
    showAlert('⚠️ La potenza massima supportata è 1000 kWp', 'error');
    return;
  }

  // Validazione Azimuth personalizzato
  const azimuthSelect = document.getElementById('azimuth').value;
  let azimuth;
  
  if (azimuthSelect === 'custom') {
    azimuth = parseInt(document.getElementById('azimuth-input').value);
    if (isNaN(azimuth) || azimuth < 0 || azimuth > 360) {
      showAlert('⚠️ Inserire un azimuth valido tra 0° e 360°', 'error');
      document.getElementById('azimuth-input').focus();
      return;
    }
  } else {
    azimuth = parseInt(azimuthSelect);
  }

  // Validazione Inclinazione
  const tilt = parseInt(document.getElementById('tilt').value);
  if (isNaN(tilt) || tilt < 0 || tilt > 90) {
    showAlert('⚠️ Inclinazione deve essere tra 0° e 90°', 'error');
    return;
  }

  // Validazione Coordinate
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    showAlert('⚠️ Coordinate non valide. Seleziona una posizione sulla mappa', 'error');
    return;
  }

  const btn = document.getElementById('btn-calc');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="margin-right: 8px;"></span>Calcolo in corso...';
  // Mostra progress indicator
  const progressEl = document.getElementById('calc-progress');
  progressEl.style.display = 'block';

  // Simula steps
  setTimeout(() => {
    document.getElementById('step-1').textContent = '✅';
    document.querySelectorAll('.progress-step')[0].classList.add('completed');
  }, 300);

  setTimeout(() => {
    document.getElementById('step-2').textContent = '✅';
    document.querySelectorAll('.progress-step')[1].classList.add('completed');
  }, 600);

  const payload = {
    lat: lat,
    lon: lon,
    power_kwp: kwp,
    tilt: tilt,
    azimuth: azimuth,
    losses: 0.14,
    
    // Parametri avanzati - Modulo
    module_type: document.getElementById('module-type').value,
    
    // Parametri avanzati - Sistema
    dc_losses: parseFloat(document.getElementById('dc-losses').value) / 100,
    ac_losses: parseFloat(document.getElementById('ac-losses').value) / 100,
    mismatch_losses: parseFloat(document.getElementById('mismatch-losses').value) / 100,
    soiling_losses: parseFloat(document.getElementById('soiling-losses').value) / 100,
    inverter_efficiency: parseFloat(document.getElementById('inverter-eff').value) / 100,
    albedo: parseFloat(document.getElementById('albedo').value)
  };

  try {
    const response = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Errore HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.hourly || data.hourly.length === 0) {
      throw new Error('Il server non ha restituito dati orari validi');
    }
    
    forecastDate = data.date;
    
    displayResults(data.hourly);
    drawChart(data.hourly);
    displayWeatherData(data.hourly);
    displayAdvancedMetrics(data.advanced_metrics);
    updateForecastTitle();
    
    // Scroll smooth ai risultati
    document.getElementById('chart-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showAlert('✅ Previsione calcolata con successo!', 'success');

  } catch (err) {
    console.error('Errore calcolo:', err);
    
    // Messaggi di errore più user-friendly
    let userMessage = 'Si è verificato un errore durante il calcolo';
    
    if (err.message.includes('fetch')) {
      userMessage = '🌐 Errore di connessione. Verifica la tua connessione internet';
    } else if (err.message.includes('empty forecast')) {
      userMessage = '📅 Nessun dato meteo disponibile per domani. Riprova più tardi';
    } else if (err.message.includes('HTTP 500')) {
      userMessage = '⚙️ Errore del server. Riprova tra qualche minuto';
    } else if (err.message.includes('HTTP 422')) {
      userMessage = '⚠️ Parametri non validi. Controlla i dati inseriti';
    } else {
      userMessage = `❌ ${err.message}`;
    }
    
    showAlert(userMessage, 'error');
    
  } finally {
  btn.disabled = false;
  btn.textContent = 'Calcola Previsione';
  document.getElementById('calc-progress').style.display = 'none';
  
  // Reset icons
  document.getElementById('step-1').textContent = '⏳';
  document.getElementById('step-2').textContent = '⏳';
  document.getElementById('step-3').textContent = '⏳';
  document.querySelectorAll('.progress-step').forEach(el => {
    el.classList.remove('active', 'completed');
  });
}
}

// ===== AGGIORNA TITOLO CON DATA =====
function updateForecastTitle() {
  const titleEl = document.getElementById('forecast-title');
  if (titleEl && forecastDate) {
    const formattedDate = formatForecastDate(forecastDate);
    titleEl.innerHTML = `📊 Previsione Produzione<br><span style="font-size: 0.85rem; font-weight: normal; color: #94a3b8;">${formattedDate}</span>`;
  }
}

// ===== RISULTATI =====
function displayResults(hourly) {
  const powers = hourly.map(h => h.power_kw);
  const totalEnergy = powers.reduce((a, b) => a + b, 0);
  const peakPower = Math.max(...powers).toFixed(2);
  const prodHours = powers.filter(p => p > 0.05).length;

  document.getElementById('total-energy').textContent = totalEnergy.toFixed(1) + ' kWh';
  document.getElementById('avg-power').textContent = (totalEnergy / (prodHours || 1)).toFixed(2) + ' kW';
  document.getElementById('peak-power').textContent = peakPower + ' kW';
  document.getElementById('prod-hours').textContent = prodHours + 'h';

  document.getElementById('results-placeholder').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

// ===== GRAFICO =====
function drawChart(hourly) {
  const labels = hourly.map(h => h.hour);
  const values = hourly.map(h => h.power_kw);

  const ctx = document.getElementById('chart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Potenza FV (kW)',
        data: values,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f1f5f9', font: { size: 12, weight: 'bold' } }
        }
      },
      scales: {
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          beginAtZero: true
        },
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });

  document.getElementById('chart-card').style.display = 'block';
}

// ===== INIZIALIZZAZIONE =====
updateMapDisplay();
updateTotalLosses();