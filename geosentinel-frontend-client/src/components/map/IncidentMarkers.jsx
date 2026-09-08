import { CircleMarker, Popup } from "react-leaflet";
import { severityLabel } from "../common/Badges";

const SEVERITY_COLOR = {
  minor: "#1e8e3e",
  road_blocked: "#b4720a",
  major: "#b3261e",
};

export default function IncidentMarkers({ reports, onSelect }) {
  return (
    <>
      {reports.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.location.latitude, r.location.longitude]}
          radius={8}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: SEVERITY_COLOR[r.severity] || "#0b5fa5",
            fillOpacity: 0.95,
          }}
          eventHandlers={{ click: () => onSelect?.(r) }}
        >
          <Popup>
            <div className="text-xs leading-relaxed">
              <p className="mb-1 font-semibold">{severityLabel(r.severity)}</p>
              <p>{r.description?.slice(0, 120)}{r.description?.length > 120 ? "…" : ""}</p>
              <p className="mt-1 text-[11px] opacity-70">
                {r.location.address || "Location on record"} &middot; {new Date(r.reportedAt).toLocaleString()}
              </p>
              <button
                onClick={() => onSelect?.(r)}
                className="mt-2 text-[11px] font-semibold underline"
              >
                View full details
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
