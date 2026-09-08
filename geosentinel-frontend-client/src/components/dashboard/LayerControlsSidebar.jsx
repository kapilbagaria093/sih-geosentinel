import { Layers, Mountain, TrendingUp, Leaf, Compass, Droplets, AlertTriangle } from "lucide-react";

const LAYER_CONFIG = [
  { id: "landslide-risk", label: "Predicted Risk Zones", icon: AlertTriangle, note: "Assumed endpoint — not yet live on backend" },
  { id: "slope", label: "Slope Angle", icon: TrendingUp },
  { id: "dem", label: "DEM (Elevation)", icon: Mountain },
  { id: "ndvi", label: "NDVI (Vegetation Index)", icon: Leaf },
  { id: "aspect", label: "Aspect", icon: Compass },
  { id: "soil-moisture", label: "Soil Moisture Content", icon: Droplets },
];

export default function LayerControlsSidebar({
  layerStates,
  onToggleLayer,
  onOpacityChange,
  districts,
  selectedDistrictId,
  onSelectDistrict,
}) {
  return (
    <aside
      className="flex h-full w-full flex-col gap-6 overflow-y-auto border-r p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      aria-label="GIS data filters and layers"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          District Filter
        </label>
        <select
          value={selectedDistrictId || ""}
          onChange={(e) => onSelectDistrict(e.target.value || null)}
          className="w-full rounded-sm border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "var(--color-border-strong)", background: "var(--color-bg)", color: "var(--color-text)" }}
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Layers size={15} style={{ color: "var(--color-accent)" }} />
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            GIS Data Layers
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {LAYER_CONFIG.map(({ id, label, icon: Icon, note }) => {
            const state = layerStates[id] || { visible: false, opacity: 0.75 };
            return (
              <div
                key={id}
                className="rounded-sm border p-3"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
              >
                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={state.visible}
                    onChange={() => onToggleLayer(id)}
                    className="h-4 w-4 shrink-0"
                  />
                  <Icon size={14} style={{ color: "var(--color-text-muted)" }} className="shrink-0" />
                  <span style={{ color: "var(--color-text)" }}>{label}</span>
                </label>
                {note && (
                  <p className="mt-1 pl-6 text-[10px] italic" style={{ color: "var(--color-text-muted)" }}>
                    {note}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2 pl-6">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={state.opacity}
                    disabled={!state.visible}
                    onChange={(e) => onOpacityChange(id, Number(e.target.value))}
                    className="w-full disabled:opacity-40"
                    aria-label={`${label} opacity`}
                  />
                  <span className="w-8 text-right text-[11px] tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                    {Math.round(state.opacity * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
