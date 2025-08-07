
const API_KEY = '50859a258804461cb1024604250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

class WeatherApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadDefaultWeather();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherInfo = document.getElementById('weatherInfo');
        
        // Current weather elements
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.condition = document.getElementById('condition');
        this.locationName = document.getElementById('locationName');
        this.localTime = document.getElementById('localTime');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.wind = document.getElementById('wind');
        this.visibility = document.getElementById('visibility');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
        
        // Forecast elements
        this.forecastContainer = document.getElementById('forecastContainer');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async loadDefaultWeather() {
        await this.getWeather('Seoul');
    }

    handleSearch() {
        const city = this.cityInput.value.trim();
        if (city) {
            this.getWeather(city);
        } else {
            this.showError('도시명을 입력해주세요.');
        }
    }

    async getWeather(city) {
        try {
            this.showLoading();
            this.hideError();
            this.hideWeatherInfo();

            // Get current weather and forecast
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`),
                fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=no`)
            ]);

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('도시를 찾을 수 없습니다. 도시명을 확인해주세요.');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            this.hideLoading();
            this.displayWeather(currentData, forecastData);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message || '날씨 정보를 가져오는 중 오류가 발생했습니다.');
        }
    }

    displayWeather(currentData, forecastData) {
        const { location, current } = currentData;
        
        // Display current weather
        this.weatherIcon.src = `https:${current.condition.icon}`;
        this.weatherIcon.alt = current.condition.text;
        this.temperature.textContent = `${Math.round(current.temp_c)}°C`;
        this.condition.textContent = current.condition.text;
        
        this.locationName.textContent = `${location.name}, ${location.country}`;
        this.localTime.textContent = `현지시간: ${this.formatDateTime(location.localtime)}`;
        
        // Display weather details
        this.feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
        this.humidity.textContent = `${current.humidity}%`;
        this.wind.textContent = `${current.wind_kph} km/h ${this.getWindDirection(current.wind_dir)}`;
        this.visibility.textContent = `${current.vis_km} km`;
        this.pressure.textContent = `${current.pressure_mb} mb`;
        this.uvIndex.textContent = `${current.uv} ${this.getUVDescription(current.uv)}`;
        
        // Display forecast
        this.displayForecast(forecastData.forecast.forecastday);
        
        this.showWeatherInfo();
    }

    displayForecast(forecastDays) {
        this.forecastContainer.innerHTML = '';
        
        forecastDays.forEach((day, index) => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const date = new Date(day.date);
            const dateStr = index === 0 ? '오늘' : 
                           index === 1 ? '내일' : 
                           this.formatDate(date);
            
            forecastItem.innerHTML = `
                <div class="date">${dateStr}</div>
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
                <div class="condition">${day.day.condition.text}</div>
                <div class="temp">
                    <div class="temp-max">${Math.round(day.day.maxtemp_c)}°</div>
                    <div class="temp-min">${Math.round(day.day.mintemp_c)}°</div>
                </div>
            `;
            
            this.forecastContainer.appendChild(forecastItem);
        });
    }

    formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString('ko-KR', options);
    }

    formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('ko-KR', options);
    }

    getWindDirection(direction) {
        const directions = {
            'N': '북', 'NNE': '북북동', 'NE': '북동', 'ENE': '동북동',
            'E': '동', 'ESE': '동남동', 'SE': '남동', 'SSE': '남남동',
            'S': '남', 'SSW': '남남서', 'SW': '남서', 'WSW': '서남서',
            'W': '서', 'WNW': '서북서', 'NW': '북서', 'NNW': '북북서'
        };
        return directions[direction] || direction;
    }

    getUVDescription(uvIndex) {
        if (uvIndex <= 2) return '(낮음)';
        if (uvIndex <= 5) return '(보통)';
        if (uvIndex <= 7) return '(높음)';
        if (uvIndex <= 10) return '(매우 높음)';
        return '(위험)';
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    showWeatherInfo() {
        this.weatherInfo.classList.remove('hidden');
    }

    hideWeatherInfo() {
        this.weatherInfo.classList.add('hidden');
    }
}

// Initialize the weather app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
