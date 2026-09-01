// WeatherAPI key (REGENERATE THIS ASAP)
const WEATHER_API_KEY = "840a70428bfd48b5a8c224759260109";

// get zip from URL
const params = new URLSearchParams(window.location.search);
const zip = params.get("zip") || "92307"; // default if none

document.getElementById("zip").textContent = "ZIP Code: " + zip;

// --- pressure history for micro-chart ---
let pressureHistory = [];   // stores tiny changes like 1.01 → 1.02
let lastPressureMb = null;  // for delta calculations

async function loadPressure() {
  const statusEl = document.getElementById("status");
  const pressureEl = document.getElementById("pressure");
  const tempEl = document.getElementById("temp");
  const updatedEl = document.getElementById("updated");

  statusEl.textContent = "Loading data...";

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${zip}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("API error " + response.status);
    }

    const data = await response.json();

    const pressureIn = data.current.pressure_in;
    const pressureMb = data.current.pressure_mb;
    const tempF = data.current.temp_f;
    const tempC = data.current.temp_c;
    const lastUpdated = data.current.last_updated;

    // --- update text fields ---
    statusEl.textContent = "Current pressure:";
    pressureEl.textContent = `${pressureIn} inHg [${pressureMb} mb]`;
    tempEl.textContent = `${tempF}°F [${tempC}°C]`;
    updatedEl.textContent = "Last updated: " + lastUpdated;

    // --- micro pressure tracking ---
    pressureHistory.push(pressureMb);

    if (pressureHistory.length > 300) {
      pressureHistory.shift(); // keep chart lightweight
    }

    // --- delta calculation ---
    if (lastPressureMb !== null) {
      const delta = (pressureMb - lastPressureMb).toFixed(2);
      document.getElementById("pressure-delta").textContent = `Δ ${delta}`;

      const trendEl = document.getElementById("pressure-trend");
      trendEl.textContent = delta > 0 ? "↑" : delta < 0 ? "↓" : "↔";
    }

    lastPressureMb = pressureMb;

    // --- update chart ---
    drawPressureChart();

  } catch (err) {
    statusEl.textContent = "Failed to load data.";
    pressureEl.textContent = err.message;
    tempEl.textContent = err.message;
    updatedEl.textContent = "";
  }
}

loadPressure();
setInterval(loadPressure, 60000);

// --- micro pressure chart ---
function drawPressureChart() {
  const canvas = document.getElementById("pressureChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  pressureHistory.forEach((value, index) => {
    const x = index * 2; // spacing
    const y = 120 - (value * 1); // 0.01 mb = 1 unit movement
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
