import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import LayerControlsSidebar from "../components/dashboard/LayerControlsSidebar";
import WeatherWidget from "../components/dashboard/WeatherWidget";
import DistrictRiskBar from "../components/dashboard/DistrictRiskBar";
import IncidentFeed from "../components/dashboard/IncidentFeed";
import IncidentDetailModal from "../components/dashboard/IncidentDetailModal";
import BulletinButton from "../components/dashboard/BulletinButton";
import MapView from "../components/map/MapView";
import AuthModal from "../components/common/AuthModal";
import { useDistricts, computeDistrictRisk } from "../hooks/useDistricts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useWeather } from "../hooks/useWeather";
import { useAuth } from "../context/AuthContext";
import { findDistrictForPoint, boundsOfFeature } from "../utils/geo";
import { PREDICTED_RISK_LAYER_ID } from "../api/layers";

const DEFAULT_LAYER_STATES = {
  [PREDICTED_RISK_LAYER_ID]: { visible: true, opacity: 0.65 },
  slope: { visible: false, opacity: 0.75 },
  dem: { visible: false, opacity: 0.75 },
  ndvi: { visible: false, opacity: 0.75 },
  aspect: { visible: false, opacity: 0.75 },
  "soil-moisture": { visible: false, opacity: 0.75 },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { districts, geojson, bounds, center } = useDistricts();
  const { layers, landslides, reports, lastUpdated, refresh } = useDashboardData();
  const { isAuthenticated, logout, user } = useAuth();

  const [layerStates, setLayerStates] = useState(DEFAULT_LAYER_STATES);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const enrichedLandslides = useMemo(() => {
    const features = districts.map((d) => d.feature);
    return landslides.data.map((r) => {
      if (!Number.isFinite(r.longitude) || !Number.isFinite(r.latitude)) return r;
      const match = findDistrictForPoint([r.longitude, r.latitude], features);
      return { ...r, _districtId: match?.properties?.dt_code ?? null };
    });
  }, [landslides.data, districts]);

  const riskByDistrict = useMemo(
    () => computeDistrictRisk(districts, enrichedLandslides),
    [districts, enrichedLandslides]
  );

  const selectedDistrictFeature = useMemo(
    () => districts.find((d) => d.id === selectedDistrictId)?.feature || null,
    [districts, selectedDistrictId]
  );

  const weatherCenter = useMemo(() => {
    if (selectedDistrictFeature) {
      const b = boundsOfFeature(selectedDistrictFeature);
      return { lat: (b.south + b.north) / 2, lon: (b.west + b.east) / 2 };
    }
    return { lat: center[0], lon: center[1] };
  }, [selectedDistrictFeature, center]);

  const weather = useWeather(weatherCenter.lat, weatherCenter.lon);

  const filteredReports = useMemo(() => {
    if (!selectedDistrictId) return reports.data;
    const feature = districts.find((d) => d.id === selectedDistrictId)?.feature;
    if (!feature) return reports.data;
    return reports.data.filter((r) => {
      if (!r.location) return false;
      return Boolean(findDistrictForPoint([r.location.longitude, r.location.latitude], [feature]));
    });
  }, [reports.data, selectedDistrictId, districts]);

  function toggleLayer(id) {
    setLayerStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible },
    }));
  }

  function setOpacity(id, value) {
    setLayerStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], opacity: value },
    }));
  }

  function handleReportIncident() {
    if (isAuthenticated) {
      navigate("/report");
    } else {
      setAuthModalOpen(true);
    }
  }

  const anyLoading = layers.loading || landslides.loading || reports.loading;

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <DashboardTopBar
        onRefresh={refresh}
        loading={anyLoading}
        lastUpdated={lastUpdated}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
        onReportIncident={handleReportIncident}
      />

      {(layers.error || landslides.error) && !anyLoading && (
        <div
          className="border-b px-4 py-2 text-center text-xs font-medium"
          style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)", borderColor: "var(--color-risk-high)" }}
        >
          {layers.error || landslides.error} — showing whatever data loaded successfully. Try Refresh once the backend is reachable.
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr_320px]">
        <div className="hidden lg:block">
          <LayerControlsSidebar
            layerStates={layerStates}
            onToggleLayer={toggleLayer}
            onOpacityChange={setOpacity}
            districts={districts}
            selectedDistrictId={selectedDistrictId}
            onSelectDistrict={setSelectedDistrictId}
          />
        </div>

        <div className="relative min-h-[420px]">
          <MapView
            center={center}
            bounds={bounds}
            geojson={geojson}
            riskByDistrict={riskByDistrict}
            layerStates={layerStates}
            landslideRecords={enrichedLandslides}
            reports={filteredReports}
            selectedDistrictId={selectedDistrictId}
            selectedDistrictFeature={selectedDistrictFeature}
            onSelectDistrict={setSelectedDistrictId}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        <aside
          className="flex flex-col gap-4 overflow-y-auto border-l p-4"
          style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
        >
          <WeatherWidget
            lat={weatherCenter.lat}
            lon={weatherCenter.lon}
            locationLabel={selectedDistrictFeature ? selectedDistrictFeature.properties.district : "Sikkim — all districts"}
          />
          <DistrictRiskBar
            districts={districts}
            riskByDistrict={riskByDistrict}
            selectedDistrictId={selectedDistrictId}
            onSelectDistrict={setSelectedDistrictId}
          />
          <IncidentFeed
            reports={filteredReports}
            loading={reports.loading}
            error={reports.error}
            notImplemented={reports.notImplemented}
            onSelect={setSelectedIncident}
          />
          <BulletinButton
            districts={districts}
            riskByDistrict={riskByDistrict}
            weather={weather.data}
            reports={filteredReports}
          />
        </aside>
      </div>

      {/* Mobile layer controls, shown below the fold on small screens */}
      <div className="lg:hidden max-h-[40vh] overflow-y-auto border-t" style={{ borderColor: "var(--color-border)" }}>
        <LayerControlsSidebar
          layerStates={layerStates}
          onToggleLayer={toggleLayer}
          onOpacityChange={setOpacity}
          districts={districts}
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={setSelectedDistrictId}
        />
      </div>

      <IncidentDetailModal report={selectedIncident} onClose={() => setSelectedIncident(null)} />
      <AuthModal
        open={authModalOpen}
        intent="report"
        onClose={() => setAuthModalOpen(false)}
        onVerified={() => {
          setAuthModalOpen(false);
          navigate("/report");
        }}
      />
    </div>
  );
}
