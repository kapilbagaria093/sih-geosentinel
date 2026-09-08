import { CircleMarker, Popup } from "react-leaflet";

export default function HistoricalLandslidePoints({ records, districtFilter }) {
  const filtered = records.filter((r) => {
    if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) return false;
    if (r.landslide !== 1) return false;
    if (districtFilter && r._districtId !== districtFilter) return false;
    return true;
  });

  return (
    <>
      {filtered.map((r, i) => (
        <CircleMarker
          key={`${r.event_id}-${i}`}
          center={[r.latitude, r.longitude]}
          radius={5}
          pathOptions={{
            color: "#7a1f1a",
            weight: 1,
            fillColor: "#c22b2b",
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <div className="text-xs leading-relaxed">
              <p className="mb-1 font-semibold">Historical Landslide Event</p>
              <p>Event ID: {r.event_id}</p>
              <p>Date: {r.event_date}</p>
              <p>Elevation: {Number.isFinite(r.elevation_m) ? `${r.elevation_m.toFixed(0)} m` : "—"}</p>
              <p>Slope: {Number.isFinite(r.slope_deg) ? `${r.slope_deg.toFixed(1)}°` : "—"}</p>
              <p>NDVI: {Number.isFinite(r.ndvi) ? r.ndvi.toFixed(2) : "—"}</p>
              <p>Soil moisture: {Number.isFinite(r.soil_moisture) ? r.soil_moisture.toFixed(2) : "—"}</p>
              <p>Sample type: {r.sample_type}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
