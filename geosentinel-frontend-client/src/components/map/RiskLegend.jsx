import { RISK_BANDS, LAYER_LEGEND_STOPS } from "../../utils/colorScales";

const LAYER_LABELS = {
  dem: "Elevation (DEM)",
  slope: "Slope Angle",
  ndvi: "NDVI (Vegetation)",
  aspect: "Aspect",
  "soil-moisture": "Soil Moisture",
  "landslide-risk": "Predicted Landslide Risk",
};

const LAYER_GRADIENTS = {
  dem: "linear-gradient(to right, #27603e, #82a84f, #d6bf68, #9c6e49, #fafafa)",
  slope: "linear-gradient(to right, #1e8e3e, #d6be3c, #e1930f, #b3261e)",
  ndvi: "linear-gradient(to right, #8c633e, #cebd66, #9cbd54, #216e39)",
  "soil-moisture": "linear-gradient(to right, #d8c496, #8cb3c4, #1a589c)",
  aspect: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
  "landslide-risk": "linear-gradient(to right, #1e8e3e, #d6be3c, #e1930f, #b3261e)",
};

export default function RiskLegend({ activeLayerIds }) {
  const activeRasterLayers = activeLayerIds.filter((id) => id !== "landslide-risk");
  const riskLayerActive = activeLayerIds.includes("landslide-risk");

  return (
    <div
      className="pointer-events-auto flex max-w-[220px] flex-col gap-3 rounded-sm border p-3 text-xs shadow-lg"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
    >
      <div>
        <p className="mb-1.5 font-semibold">Landslide Risk Zones</p>
        <div className="flex flex-col gap-1">
          {RISK_BANDS.map((band) => (
            <div key={band.level} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: band.color }} />
              <span style={{ color: "var(--color-text-muted)" }}>{band.label}</span>
            </div>
          ))}
        </div>
        {!riskLayerActive && (
          <p className="mt-1 text-[10px] italic" style={{ color: "var(--color-text-muted)" }}>
            Enable "Predicted Risk" layer to view zones on map
          </p>
        )}
      </div>

      {activeRasterLayers.length > 0 && (
        <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
          {activeRasterLayers.map((id) => (
            <div key={id}>
              <p className="mb-1 text-[11px] font-medium">{LAYER_LABELS[id] || id}</p>
              <div className="h-2 w-full rounded-sm" style={{ background: LAYER_GRADIENTS[id] }} />
              <div className="mt-0.5 flex justify-between text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                <span>{LAYER_LEGEND_STOPS[id]?.low}</span>
                <span>{LAYER_LEGEND_STOPS[id]?.high}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 border-t pt-2 text-[10px]" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#c22b2b" }} /> Historical event
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: "#0b5fa5" }} /> Reported incident
        </span>
      </div>
    </div>
  );
}
