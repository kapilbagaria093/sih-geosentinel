import { CloudRain, Thermometer, RefreshCw } from "lucide-react";
import { useWeather, weatherCodeLabel } from "../../hooks/useWeather";

export default function WeatherWidget({ lat, lon, locationLabel }) {
  const { data, loading, error, refresh } = useWeather(lat, lon);

  return (
    <div className="rounded-sm border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          <CloudRain size={14} style={{ color: "var(--color-accent)" }} />
          Weather &amp; Rainfall
        </h3>
        <button onClick={refresh} aria-label="Refresh weather" className="rounded p-1 hover:opacity-70">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} style={{ color: "var(--color-text-muted)" }} />
        </button>
      </div>

      <p className="mb-3 text-[11px]" style={{ color: "var(--color-text-muted)" }}>{locationLabel}</p>

      {error && (
        <p className="text-xs" style={{ color: "var(--color-risk-high)" }}>
          Unable to load weather data: {error}
        </p>
      )}

      {!error && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-sm p-2.5" style={{ background: "var(--color-bg)" }}>
            <p className="mb-1 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              <CloudRain size={12} /> 24h Rainfall
            </p>
            <p className="text-lg font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
              {loading ? "—" : `${data?.cumulative24hRainfallMm ?? 0} mm`}
            </p>
          </div>
          <div className="rounded-sm p-2.5" style={{ background: "var(--color-bg)" }}>
            <p className="mb-1 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              <Thermometer size={12} /> Temperature
            </p>
            <p className="text-lg font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
              {loading ? "—" : `${Math.round(data?.temperatureC ?? 0)}°C`}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-2.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          Condition: {weatherCodeLabel(data?.weatherCode)}
        </p>
      )}
      <p className="mt-2 text-[10px] italic" style={{ color: "var(--color-text-muted)" }}>
        Live public weather feed &mdash; not part of the GeoSentinel backend.
      </p>
    </div>
  );
}
