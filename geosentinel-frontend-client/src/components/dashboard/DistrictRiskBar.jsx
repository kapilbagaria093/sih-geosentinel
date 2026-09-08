import { Gauge } from "lucide-react";
import { RiskBadge } from "../common/Badges";

const RISK_COLOR = {
  low: "var(--color-risk-low)",
  moderate: "var(--color-risk-moderate)",
  high: "var(--color-risk-high)",
};

export default function DistrictRiskBar({ districts, riskByDistrict, selectedDistrictId, onSelectDistrict }) {
  const maxEvents = Math.max(1, ...districts.map((d) => riskByDistrict[d.id]?.confirmedEvents || 0));

  return (
    <div className="rounded-sm border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        <Gauge size={14} style={{ color: "var(--color-accent)" }} />
        District Risk Level
      </h3>
      <div className="flex flex-col gap-3">
        {districts.map((d) => {
          const risk = riskByDistrict[d.id] || { level: "low", confirmedEvents: 0 };
          const widthPct = Math.max(6, (risk.confirmedEvents / maxEvents) * 100);
          const isSelected = selectedDistrictId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDistrict(isSelected ? null : d.id)}
              className="flex flex-col gap-1.5 rounded-sm p-1.5 text-left transition-colors"
              style={{ background: isSelected ? "var(--color-navy-tint)" : "transparent" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{d.name}</span>
                <RiskBadge level={risk.level} compact />
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, background: RISK_COLOR[risk.level] }}
                />
              </div>
              <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                {risk.confirmedEvents} confirmed event{risk.confirmedEvents === 1 ? "" : "s"} on record
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
