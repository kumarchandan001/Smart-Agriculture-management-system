import React, { useState } from "react";
import {
  Cloud,
  Droplets,
  Wind,
  Eye,
  Gauge,
  MapPin,
  Search,
  Loader,
  CloudRain,
  Sun,
} from "lucide-react";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [lat, setLat] = useState("12.6492");
  const [lon, setLon] = useState("77.4387");
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

  const mapWmoToWeather = (code) => {
    if (code === 0) return { description: "Clear sky", icon: "01d" };
    if (code <= 3) return { description: "Partly cloudy", icon: "02d" };
    if (code <= 48) return { description: "Foggy", icon: "50d" };
    if (code <= 55) return { description: "Drizzle", icon: "09d" };
    if (code <= 65) return { description: "Rain", icon: "10d" };
    if (code <= 75) return { description: "Snow", icon: "13d" };
    if (code <= 82) return { description: "Rain showers", icon: "09d" };
    return { description: "Thunderstorm", icon: "11d" };
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    // 1. Try OpenWeatherMap if a real API key is configured
    if (apiKey && apiKey !== "your_openweathermap_api_key_here") {
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const current = data.list[0];
          const dailyForecasts = {};
          data.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split("T")[0];
            const hour = date.getHours();
            if (!dailyForecasts[dateKey] || Math.abs(hour - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
              dailyForecasts[dateKey] = item;
            }
          });

          const daily = Object.values(dailyForecasts).slice(0, 5).map((item) => ({
            date: new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            temp: Math.round(item.main.temp),
            temp_min: Math.round(item.main.temp_min),
            temp_max: Math.round(item.main.temp_max),
            humidity: item.main.humidity,
            pop: item.pop,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            wind_speed: item.wind.speed,
          }));

          setWeather({
            cityName: data.city.name,
            current: {
              temp: Math.round(current.main.temp),
              feels_like: Math.round(current.main.feels_like),
              humidity: current.main.humidity,
              wind_speed: current.wind.speed,
              clouds: current.clouds.all,
              visibility: (current.visibility / 1000).toFixed(1),
              pressure: current.main.pressure,
              description: current.weather[0].description,
              icon: current.weather[0].icon,
            },
            daily,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("OpenWeatherMap failed, switching to Open-Meteo fallback:", e);
      }
    }

    // 2. Open-Meteo Fallback (100% Free, No API Key needed, zero 401 errors)
    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(openMeteoUrl);
      if (!res.ok) {
        throw new Error(`Weather service responded with status: ${res.status}`);
      }
      const data = await res.json();
      const currentMeta = mapWmoToWeather(data.current.weather_code);

      const daily = (data.daily.time || []).slice(0, 5).map((t, idx) => {
        const meta = mapWmoToWeather(data.daily.weather_code[idx]);
        const d = new Date(t);
        return {
          date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          temp: Math.round(((data.daily.temperature_2m_max[idx] || 0) + (data.daily.temperature_2m_min[idx] || 0)) / 2),
          temp_min: Math.round(data.daily.temperature_2m_min[idx] || 0),
          temp_max: Math.round(data.daily.temperature_2m_max[idx] || 0),
          humidity: Math.round(data.current.relative_humidity_2m || 65),
          pop: ((data.daily.precipitation_probability_max && data.daily.precipitation_probability_max[idx]) || 0) / 100,
          description: meta.description,
          icon: meta.icon,
          wind_speed: Math.round(data.current.wind_speed_10m || 5),
        };
      });

      setWeather({
        cityName: `Farm Field (${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°)`,
        current: {
          temp: Math.round(data.current.temperature_2m),
          feels_like: Math.round(data.current.apparent_temperature),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind_speed: Math.round(data.current.wind_speed_10m),
          clouds: 20,
          visibility: "10.0",
          pressure: Math.round(data.current.surface_pressure),
          description: currentMeta.description,
          icon: currentMeta.icon,
        },
        daily,
      });
    } catch (err) {
      setError(err.message || "Failed to load weather forecast");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(4));
          setLon(position.coords.longitude.toFixed(4));
          setLoading(false);
        },
        (err) => {
          setError("Unable to get location: " + err.message);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-linear-to-r from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-sky-600" />
          Weather Configuration
        </h3>

        <div className="space-y-4">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g., 13.0827"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="e.g., 80.2707"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              Use Current Location
            </button>
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Get Weather
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Weather Display */}
      {weather && (
        <div className="space-y-6">
          {/* Current Weather Card */}
          <div className="bg-linear-to-br from-sky-400 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-sky-100" />
                  <p className="text-sky-100 text-lg">{weather.cityName}</p>
                </div>
                <h2 className="text-6xl font-bold mb-3">
                  {weather.current.temp}°C
                </h2>
                <p className="text-sky-50 capitalize text-lg">
                  {weather.current.description}
                </p>
                <p className="text-sm text-sky-100 mt-2">
                  Feels like {weather.current.feels_like}°C
                </p>
              </div>
              <div className="text-right">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`}
                  alt="weather icon"
                  className="w-32 h-32"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-sky-100">Humidity</p>
                  <p className="text-xl font-semibold">
                    {weather.current.humidity}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-sky-100">Wind Speed</p>
                  <p className="text-xl font-semibold">
                    {weather.current.wind_speed} m/s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-sky-100">Visibility</p>
                  <p className="text-xl font-semibold">
                    {weather.current.visibility} km
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-sky-100">Pressure</p>
                  <p className="text-xl font-semibold">
                    {weather.current.pressure} hPa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-sky-100">Cloudiness</p>
                  <p className="text-xl font-semibold">
                    {weather.current.clouds}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Cards */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {weather.daily.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300"
                >
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    {day.date}
                  </p>

                  <div className="flex justify-center mb-3">
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.description}
                      className="w-20 h-20"
                    />
                  </div>

                  <p className="text-xs text-gray-600 capitalize text-center mb-4 h-8">
                    {day.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Temperature</span>
                      <span className="text-lg font-bold text-gray-900">
                        {day.temp}°C
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">High / Low</span>
                      <span className="text-sm font-semibold text-gray-700">
                        <span className="text-red-500">{day.temp_max}°</span> /{" "}
                        <span className="text-blue-500">{day.temp_min}°</span>
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-600">
                            Humidity
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {day.humidity}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Wind</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {day.wind_speed} m/s
                        </span>
                      </div>

                      {day.pop > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CloudRain className="w-4 h-4 text-sky-500" />
                            <span className="text-xs text-gray-600">Rain</span>
                          </div>
                          <span className="text-sm font-semibold text-sky-600">
                            {Math.round(day.pop * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!weather && !loading && (
        <div className="text-center py-16 text-gray-500">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <Cloud className="w-10 h-10 text-sky-400" />
          </div>
          <p className="text-lg font-medium text-gray-700">
            Enter your API key and location
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Get started with real-time weather forecasts
          </p>
        </div>
      )}
    </div>
  );
}
