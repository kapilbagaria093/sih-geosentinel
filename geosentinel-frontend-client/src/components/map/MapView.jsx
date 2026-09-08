import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import GeoTiffLayer from "./GeoTiffLayer";
import DistrictBoundaries from "./DistrictBoundaries";
import HistoricalLandslidePoints from "./HistoricalLandslidePoints";
import IncidentMarkers from "./IncidentMarkers";
import RiskLegend from "./RiskLegend";
import { useTheme } from "../../context/ThemeContext";
import { boundsOfFeature } from "../../utils/geo";

// Leaflet's default marker icon assets don't resolve correctly through
// Vite's bundler — we don't use L.marker's default icon anywhere (only
// CircleMarker), so this just prevents a broken-icon console warning.
delete L.Icon.Default.prototype._getIconUrl;

const TILE_SETS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  hc: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
};

function FitToBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(
      [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ],
      { padding: [24, 24] }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function FlyToDistrict({ feature }) {
  const map = useMap();
  useEffect(() => {
    if (!feature) return;
    const b = boundsOfFeature(feature);
    map.flyToBounds(
      [
        [b.south, b.west],
        [b.north, b.east],
      ],
      { padding: [40, 40], duration: 0.6 }
    );
  }, [feature, map]);
  return null;
}

export default function MapView({
  center,
  bounds,
  geojson,
  riskByDistrict,
  layerStates,
  landslideRecords,
  reports,
  selectedDistrictId,
  selectedDistrictFeature,
  onSelectDistrict,
  onSelectIncident,
}) {
  const { theme } = useTheme();
  const tiles = TILE_SETS[theme] || TILE_SETS.light;
  const activeLayerIds = useMemo(
    () => Object.entries(layerStates).filter(([, s]) => s.visible).map(([id]) => id),
    [layerStates]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={10}
        minZoom={7}
        className="h-full w-full"
        style={{ background: "var(--color-bg)" }}
        zoomControl={false}
      >
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <FitToBounds bounds={bounds} />
        {selectedDistrictFeature && <FlyToDistrict feature={selectedDistrictFeature} />}

        {Object.entries(layerStates).map(([id, s]) => (
          <GeoTiffLayer
            key={id}
            layerId={id}
            visible={s.visible}
            opacity={s.opacity}
            fallbackBounds={bounds}
          />
        ))}

        <DistrictBoundaries
          geojson={geojson}
          riskByDistrict={riskByDistrict}
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={onSelectDistrict}
        />

        <HistoricalLandslidePoints records={landslideRecords} districtFilter={selectedDistrictId} />
        <IncidentMarkers reports={reports} onSelect={onSelectIncident} />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500]">
        <RiskLegend activeLayerIds={activeLayerIds} />
      </div>
    </div>
  );
}
