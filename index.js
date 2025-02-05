// Selección de elementos del DOM
const form = document.getElementById("weatherForm");
const resultDiv = document.getElementById("weatherResult");
const errorDiv = document.getElementById("errorMessage");
const cityInput = document.getElementById("cityInput");
const chartCanvas = document.getElementById("weatherChart").getContext("2d");

let chartInstance = null; // Variable para almacenar la instancia del gráfico

// Evento submit del formulario para obtener datos del clima
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  // Limpiar mensajes de error y resultados anteriores
  errorDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Obtener ciudades ingresadas, separándolas por comas y eliminando espacios extra
  const cities = cityInput.value.split(",").map(city => city.trim()).filter(city => city);
  
  if (cities.length === 0) {
    showError("¡Por favor, ingrese al menos una ciudad!");
    return;
  }

  try {
    // Llamada a la función que obtiene los datos de la API para cada ciudad
    const weatherData = await fetchWeatherData(cities);
    // Mostrar cada resultado en una tarjeta individual
    displayWeather(weatherData);
    // Crear el gráfico comparativo de temperaturas
    renderChart(weatherData);
  } catch (error) {
    // En caso de error, mostrar mensaje y limpiar resultados
    showError(error.message);
    resultDiv.innerHTML = "";
    if (chartInstance) {
      chartInstance.destroy();
    }
  }
});

// Función para obtener datos del clima de múltiples ciudades usando Promise.all()
async function fetchWeatherData(cities) {
  const apiKey = "d49f768bd5ea4f249972455f214cadfe"; // Clave de la API de OpenWeatherMap
  // Crear array de promesas para cada ciudad
  const requests = cities.map(city => 
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => {
        // Si la respuesta no es exitosa, lanzar error indicando la ciudad problemática
        if (!response.ok) {
          throw new Error(`Ciudad no encontrada: ${city}`);
        }
        return response.json();
      })
  );
  // Esperar a que todas las promesas se resuelvan
  return await Promise.all(requests);
}

// Función para mostrar los datos del clima en tarjetas de Bootstrap
function displayWeather(data) {
  // Mapear cada objeto de datos y crear una tarjeta con la información.
  const cardsHTML = data.map(cityData => `
    <div class="weather-col mb-3">
      <div class="card result-card p-3">
        <div class="card-body text-center">
          <h5 class="card-title">${cityData.name}, ${cityData.sys.country} <i class="fas fa-map-marker-alt text-info"></i></h5>
          <p class="mb-2"><i class="fas fa-temperature-high text-danger"></i> <strong>${cityData.main.temp}°C</strong></p>
          <p class="mb-2"><i class="fas fa-cloud text-primary"></i> ${cityData.weather[0].description}</p>
          <p class="mb-0"><i class="fas fa-tint text-info"></i> Humedad: ${cityData.main.humidity}%</p>
        </div>
      </div>
    </div>
  `).join("");
  
  resultDiv.innerHTML = cardsHTML;
}

// Función para crear un gráfico de barras comparando las temperaturas usando Chart.js
function renderChart(data) {
  const labels = data.map(cityData => cityData.name); // Nombres de las ciudades
  const temperatures = data.map(cityData => cityData.main.temp); // Temperaturas
  
  chartInstance = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperatura (°C)",
        data: temperatures,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Función para errores
function showError(message) {
  errorDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}