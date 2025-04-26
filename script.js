const WEATHER_API_KEY = 'c2cbb535ef6dd4051024234cc9b9581d'; 

// DOM Elements
const searchInput = document.getElementById('country-search');
const searchBtn = document.getElementById('search-btn');
const countryResults = document.getElementById('country-results');
const modal = document.getElementById('details-modal');
const modalContent = document.getElementById('modal-content');
const closeBtn = document.querySelector('.close-btn');

// Event Listeners
searchBtn.addEventListener('click', searchCountry);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchCountry();
});
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', outsideClick);

// Search for country
async function searchCountry() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Please enter a country name');
        return;
    }
    
    try {
        countryResults.innerHTML = '<div class="loading">Loading countries...</div>';
        const response = await fetch(`https://restcountries.com/v3.1/name/${searchTerm}`);
        
        if (!response.ok) throw new Error('Country not found');
        
        const data = await response.json();
        displayCountries(data);
    } catch (error) {
        console.error('Search error:', error);
        countryResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// Display countries in grid
function displayCountries(countries) {
    countryResults.innerHTML = '';
    
    countries.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.innerHTML = `
            <img src="${country.flags.png}" alt="${country.name.common}" class="country-flag">
            <div class="country-info">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Region:</strong> ${country.region}</p>
                <button class="details-btn" data-country="${country.name.common}">More Details</button>
            </div>
        `;
        countryResults.appendChild(countryCard);
    });
    
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', showCountryDetails);
    });
}

// Show country details with weather
async function showCountryDetails(e) {
    const countryName = e.target.getAttribute('data-country');
    
    try {
        modalContent.innerHTML = '<div class="loading">Loading details...</div>';
        modal.style.display = 'block';

        // Fetch country data
        const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        if (!countryResponse.ok) throw new Error('Country data unavailable');
        
        const countryData = await countryResponse.json();
        const country = countryData[0];
        const capitalCity = country.capital?.[0] || countryName;

        let weatherHTML = '<p class="weather-unavailable">Weather data not available</p>';
        try {
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capitalCity)}&units=metric&appid=${WEATHER_API_KEY}`
            );
            
            
            
            if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();
                weatherHTML = `
                    <div class="weather-info">
                        <h3>Weather in ${capitalCity}</h3>
                        <div class="weather-grid">
                            <div class="weather-main">
                                <span class="weather-temp">${Math.round(weatherData.main.temp)}°C</span>
                                <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" 
                                     alt="${weatherData.weather[0].description}" class="weather-icon">
                            </div>
                            <div class="weather-details">
                                <p><i class="fas fa-tint"></i> Humidity: ${weatherData.main.humidity}%</p>
                                <p><i class="fas fa-wind"></i> Wind: ${weatherData.wind.speed} m/s</p>
                                <p><i class="fas fa-cloud"></i> ${weatherData.weather[0].description}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (weatherError) {
            console.error('Weather error:', weatherError);
        }
        // =============================================

        // Display all data
        modalContent.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <div class="modal-country">
                    <img src="${country.flags.png}" alt="${country.name.common}" class="modal-flag">
                    <div class="modal-details">
                        <h2>${country.name.common}</h2>
                        <div class="country-details">
                            <p><strong>Official Name:</strong> ${country.name.official}</p>
                            <p><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
                            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                            <p><strong>Region:</strong> ${country.region} ${country.subregion ? `(${country.subregion})` : ''}</p>
                            <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                            <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A'}</p>
                        </div>
                        ${weatherHTML}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <div class="error">
                <p>Failed to load details</p>
                <p>${error.message}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
}
function closeModal() {
    modal.style.display = 'none';
}

function outsideClick(e) {
    if (e.target === modal) closeModal();
}