const RISK_STYLES = {
  low: { bg: "var(--color-risk-low-bg)", fg: "var(--color-risk-low)", label: "Low Risk" },
  moderate: { bg: "var(--color-risk-moderate-bg)", fg: "var(--color-risk-moderate)", label: "Moderate Risk" },
  high: { bg: "var(--color-risk-high-bg)", fg: "var(--color-risk-high)", label: "Critical / High Risk" },
};

export function RiskBadge({ level, compact = false }) {
  const style = RISK_STYLES[level] || RISK_STYLES.low;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold"
      style={{ background: style.bg, color: style.fg, borderColor: style.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.fg }} />
      {compact ? style.label.replace(" Risk", "") : style.label}
    </span>
  );
}

const SEVERITY_LABELS = {
  minor: { label: "Minor Debris", level: "low" },
  road_blocked: { label: "Road Blocked", level: "moderate" },
  major: { label: "Major Slope Failure", level: "high" },
};

export function SeverityBadge({ severity }) {
  const info = SEVERITY_LABELS[severity] || { label: severity, level: "low" };
  return <RiskBadge level={info.level} compact={false} />;
}

export function severityLabel(severity) {
  return SEVERITY_LABELS[severity]?.label || severity;
}

const STATUS_STYLES = {
  active: { bg: "var(--color-risk-high-bg)", fg: "var(--color-risk-high)", label: "Active Blockage" },
  cleared: { bg: "var(--color-risk-low-bg)", fg: "var(--color-risk-low)", label: "Cleared" },
  monitoring: { bg: "var(--color-risk-moderate-bg)", fg: "var(--color-risk-moderate)", label: "Monitoring" },
};

export function StatusTag({ status = "monitoring" }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.monitoring;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}
