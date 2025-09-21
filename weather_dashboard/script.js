
const apiKey = "a6fc8af6a3659e1abba62ac6793eb20c";

const weatherCard = document.getElementById('weatherCard');
const cityNameEl = document.getElementById('cityName');
const descriptionEl = document.getElementById('description');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIconEl = document.getElementById('weatherIcon');
const forecastContainer = document.getElementById('forecastContainer');
const overlay = document.getElementById('overlay');
const unitToggle = document.getElementById('unitToggle');

let isFahrenheit = false;

function setBackground(weatherMain) {
  let bgUrl;

  if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
    bgUrl = "images/rain.png";
  } 
  else if (weatherMain.includes("cloud")) {
    bgUrl = "images/cloud.png";
  } 
  else if (weatherMain.includes("clear")) {
    bgUrl = "images/sunny.png";
  } 
  else if (weatherMain.includes("snow")) {
    bgUrl = "images/snow.png";
  } 
  else {
    bgUrl = "images/default.png";
  }

  overlay.style.backgroundImage = `url(${bgUrl})`;
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value;
  if(city) fetchWeather(city);
});

unitToggle.addEventListener('change', () => {
  isFahrenheit = unitToggle.checked;
  const city = cityNameEl.textContent.split(",")[0];
  if(city) fetchWeather(city);
});

async function fetchWeather(city) {
  try {
    const unit = isFahrenheit ? "imperial" : "metric";
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`);
    const data = await res.json();
    if(data.cod === 200) {
      displayWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    } else {
      alert("City not found!");
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching weather data");
  }
}

function displayWeather(data) {
  weatherCard.style.display = 'block';
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  descriptionEl.textContent = data.weather[0].description.toUpperCase();
  const unitSymbol = isFahrenheit ? "°F" : "°C";
  temperatureEl.textContent = `🌡️ ${data.main.temp}${unitSymbol}`;
  humidityEl.textContent = `💧 ${data.main.humidity}%`;
  windEl.textContent = `💨 ${data.wind.speed} ${isFahrenheit ? "mph" : "m/s"}`;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  setBackground(data.weather[0].main.toLowerCase());
}

async function fetchForecast(lat, lon) {
  const unit = isFahrenheit ? "imperial" : "metric";
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
    const data = await res.json();
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    forecastContainer.innerHTML = "";
    daily.forEach(d => {
      const dayName = new Date(d.dt_txt).toLocaleDateString('en-US',{ weekday:'short' });
      const temp = Math.round(d.main.temp);
      const icon = `https://openweathermap.org/img/wn/${d.weather[0].icon}.png`;
      const unitSymbol = isFahrenheit ? "°F" : "°C";
      const dayCard = document.createElement('div');
      dayCard.className = 'forecast-day';
      dayCard.innerHTML = `<p>${dayName}</p><img src="${icon}" alt="${d.weather[0].description}"><p>${temp}${unitSymbol}</p>`;
      forecastContainer.appendChild(dayCard);
    });
  } catch(err) {
    console.error(err);
    alert("Error fetching forecast");
  }
}

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      console.warn("Geolocation failed or denied", err);
    });
  }
});

async function fetchWeatherByCoords(lat, lon) {
  const unit = isFahrenheit ? "imperial" : "metric";
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
    const data = await res.json();
    displayWeather(data);
    fetchForecast(lat, lon);
  } catch(err) {
    console.error(err);
  }
}
