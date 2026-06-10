// your WeatherAPI key
const WEATHER_API_KEY = "YOUR_KEY_HERE";

// get zip from URL
const params = new URLSearchParams(window.location.search);
const zip = params.get("zip") || "92307"; // default if none

document.getElementById("zip").textContent = "ZIP Code: " + zip;

async function loadPressure() {
  const statusEl = document.getElementById("status");
  const pressureEl = document.getElementById("pressure");
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
    const lastUpdated = data.current.last_updated;

    statusEl.textContent = "Current pressure:";
    pressureEl.textContent = `${pressureIn} inHg (${pressureMb} mb)`;
    updatedEl.textContent = "Last updated: " + lastUpdated;
  } catch (err) {
    statusEl.textContent = "Failed to load data.";
    pressureEl.textContent = err.message;
    updatedEl.textContent = "";
  }
}

loadPressure();
setInterval(loadPressure, 60000);
