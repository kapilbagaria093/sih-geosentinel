import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import { useTheme } from "../../context/ThemeContext";

const TILE_SETS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  hc: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
};

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ center, value, onChange }) {
  const { theme } = useTheme();
  const tileUrl = TILE_SETS[theme] || TILE_SETS.light;

  return (
    <div className="h-56 w-full overflow-hidden rounded-sm border" style={{ borderColor: "var(--color-border-strong)" }}>
      <MapContainer center={center} zoom={10} className="h-full w-full" zoomControl={true}>
        <TileLayer url={tileUrl} attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
        <ClickCatcher onPick={(lat, lng) => onChange({ latitude: lat, longitude: lng })} />
        {value.latitude != null && value.longitude != null && (
          <CircleMarker
            center={[value.latitude, value.longitude]}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#c22b2b", fillOpacity: 0.9 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
