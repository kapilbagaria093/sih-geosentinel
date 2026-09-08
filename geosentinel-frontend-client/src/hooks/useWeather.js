import { useEffect, useState, useCallback } from "react";

// ASSUMPTION: the backend has no weather/rainfall module (it only exposes
// auth, landslides, layers, and reports). The design brief still calls for
// a "Live Weather & Rainfall Metric Widget", so this hook talks directly to
// Open-Meteo (https://open-meteo.com), a free, key-less public weather API,
// from the browser. This is a frontend-only integration and does not touch
// the GeoSentinel backend at all.
export function useWeather(lat, lon) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const fetchWeather = useCallback(async () => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", lat);
      url.searchParams.set("longitude", lon);
      url.searchParams.set("hourly", "precipitation");
      url.searchParams.set("current", "temperature_2m,precipitation,weather_code");
      url.searchParams.set("timezone", "auto");
      url.searchParams.set("past_days", "1");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Weather service responded ${res.status}`);
      const json = await res.json();

      const hourlyTimes = json.hourly?.time || [];
      const hourlyPrecip = json.hourly?.precipitation || [];
      const now = new Date();
      let last24hRainfall = 0;
      hourlyTimes.forEach((t, i) => {
        const time = new Date(t);
        const diffHours = (now - time) / 36e5;
        if (diffHours >= 0 && diffHours <= 24) {
          last24hRainfall += hourlyPrecip[i] || 0;
        }
      });

      setState({
        loading: false,
        error: null,
        data: {
          temperatureC: json.current?.temperature_2m ?? null,
          currentPrecipitationMm: json.current?.precipitation ?? 0,
          cumulative24hRainfallMm: Math.round(last24hRainfall * 10) / 10,
          weatherCode: json.current?.weather_code ?? null,
          observedAt: json.current?.time ?? null,
        },
      });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { ...state, refresh: fetchWeather };
}

// Minimal WMO weather_code -> human label map (subset relevant to monsoon Sikkim).
export function weatherCodeLabel(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
  };
  return map[code] ?? "—";
}
