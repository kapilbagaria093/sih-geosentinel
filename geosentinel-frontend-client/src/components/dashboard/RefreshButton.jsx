import { RefreshCw } from "lucide-react";

export default function RefreshButton({ onRefresh, loading, lastUpdated }) {
  return (
    <div className="flex items-center gap-2.5">
      {lastUpdated && (
        <span className="hidden text-[11px] sm:inline" style={{ color: "var(--color-text-on-navy)", opacity: 0.7 }}>
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-60"
        style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--color-text-on-navy)" }}
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  );
}
