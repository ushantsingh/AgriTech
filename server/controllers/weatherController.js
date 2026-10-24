const axios = require('axios');
const WeatherData = require('../models/WeatherData');

// Generate mock weather data as fallback
const generateMockWeather = (location) => {
  const conditions = ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny', 'Overcast'];
  const icons = ['01d', '02d', '10d', '01d', '04d'];
  const baseTemp = 25 + Math.random() * 10;

  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const idx = Math.floor(Math.random() * conditions.length);
    forecast.push({
      date: d,
      tempMin: Math.round(baseTemp - 5 + Math.random() * 3),
      tempMax: Math.round(baseTemp + Math.random() * 5),
      humidity: Math.round(50 + Math.random() * 40),
      description: conditions[idx],
      icon: icons[idx],
    });
  }

  const alerts = [];
  if (Math.random() > 0.6) {
    alerts.push({
      type: 'pest',
      message: 'High humidity may increase risk of fungal diseases. Monitor crops closely.',
      severity: 'medium',
    });
  }
  if (baseTemp > 32) {
    alerts.push({
      type: 'heat',
      message: 'High temperature alert. Ensure adequate irrigation for crops.',
      severity: 'high',
    });
  }

  return {
    location,
    temperature: Math.round(baseTemp),
    humidity: Math.round(55 + Math.random() * 30),
    rainfall: Math.round(Math.random() * 20 * 10) / 10,
    windSpeed: Math.round(5 + Math.random() * 15),
    description: conditions[Math.floor(Math.random() * conditions.length)],
    icon: icons[Math.floor(Math.random() * icons.length)],
    forecast,
    alerts,
  };
};

// GET /api/weather?location=CityName
const getWeather = async (req, res, next) => {
  try {
    const location = req.query.location || 'Delhi';
    const apiKey = process.env.WEATHER_API_KEY;

    // Try cached data first (less than 1 hour old)
    const cached = await WeatherData.findOne({
      location: { $regex: new RegExp(location, 'i') },
      createdAt: { $gte: new Date(Date.now() - 3600000) },
    }).lean();

    if (cached) {
      return res.json(cached);
    }

    // Try OpenWeatherMap API
    if (apiKey && apiKey !== 'your_openweathermap_api_key_here') {
      try {
        const [currentRes, forecastRes] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&cnt=40`),
        ]);

        const current = currentRes.data;
        // Group forecast by day
        const dailyMap = {};
        forecastRes.data.list.forEach((item) => {
          const day = item.dt_txt.split(' ')[0];
          if (!dailyMap[day]) {
            dailyMap[day] = { temps: [], humidities: [], descriptions: [], icons: [] };
          }
          dailyMap[day].temps.push(item.main.temp);
          dailyMap[day].humidities.push(item.main.humidity);
          dailyMap[day].descriptions.push(item.weather[0].description);
          dailyMap[day].icons.push(item.weather[0].icon);
        });

        const forecast = Object.entries(dailyMap).slice(0, 5).map(([date, data]) => ({
          date: new Date(date),
          tempMin: Math.round(Math.min(...data.temps)),
          tempMax: Math.round(Math.max(...data.temps)),
          humidity: Math.round(data.humidities.reduce((a, b) => a + b) / data.humidities.length),
          description: data.descriptions[Math.floor(data.descriptions.length / 2)],
          icon: data.icons[Math.floor(data.icons.length / 2)],
        }));

        const weatherData = {
          location,
          temperature: Math.round(current.main.temp),
          humidity: current.main.humidity,
          rainfall: current.rain ? current.rain['1h'] || 0 : 0,
          windSpeed: Math.round(current.wind.speed),
          description: current.weather[0].description,
          icon: current.weather[0].icon,
          forecast,
          alerts: [],
        };

        // Cache it
        await WeatherData.create(weatherData);
        return res.json(weatherData);
      } catch (apiErr) {
        console.log('Weather API failed, using mock data:', apiErr.message);
      }
    }

    // Fallback to mock data
    const mockData = generateMockWeather(location);
    await WeatherData.create(mockData);
    res.json(mockData);
  } catch (error) {
    next(error);
  }
};

module.exports = { getWeather };
