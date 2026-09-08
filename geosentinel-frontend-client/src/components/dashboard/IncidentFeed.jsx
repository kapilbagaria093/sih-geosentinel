import { useState } from "react";
import { ListChecks, Search, Loader2, Inbox } from "lucide-react";
import { SeverityBadge } from "../common/Badges";
import { getReportById } from "../../api/reports";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function IncidentFeed({ reports, loading, error, notImplemented, onSelect }) {
  const [lookupId, setLookupId] = useState("");
  const [lookupState, setLookupState] = useState({ loading: false, error: null });

  async function handleLookup(e) {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupState({ loading: true, error: null });
    try {
      const res = await getReportById(lookupId.trim());
      onSelect(res.data);
      setLookupId("");
      setLookupState({ loading: false, error: null });
    } catch (err) {
      setLookupState({ loading: false, error: err.message });
    }
  }

  return (
    <div className="rounded-sm border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        <ListChecks size={14} style={{ color: "var(--color-accent)" }} />
        Recent Reported Incidents
      </h3>

      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Loader2 size={14} className="animate-spin" /> Loading feed…
        </div>
      )}

      {!loading && error && !notImplemented && (
        <p className="text-xs" style={{ color: "var(--color-risk-high)" }}>Could not load incidents: {error}</p>
      )}

      {!loading && notImplemented && (
        <div className="mb-3 rounded-sm border px-3 py-2.5 text-xs" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-muted)" }}>
          <p className="mb-1 flex items-center gap-1.5 font-medium" style={{ color: "var(--color-text)" }}>
            <Inbox size={13} /> Live feed not available yet
          </p>
          <p>
            <code className="text-[11px]">GET /reports</code> isn't implemented on the backend yet, so this feed can't
            list incidents automatically. You can still look up any report you have the ID for below.
          </p>
        </div>
      )}

      {!loading && !notImplemented && !error && reports.length === 0 && (
        <p className="py-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
          No incidents reported in this view yet.
        </p>
      )}

      {!loading && reports.length > 0 && (
        <ul className="flex flex-col gap-2">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r)}
                className="flex w-full flex-col gap-1.5 rounded-sm border p-2.5 text-left transition-colors hover:opacity-90"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={r.severity} />
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{timeAgo(r.reportedAt)}</span>
                </div>
                <p className="line-clamp-2 text-xs" style={{ color: "var(--color-text)" }}>{r.description}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{r.location?.address || "Unnamed location"}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleLookup} className="mt-4 border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
        <label className="mb-1.5 block text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
          Track a report by ID
        </label>
        <div className="flex gap-2">
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="report-uuid"
            className="w-full rounded-sm border px-2.5 py-1.5 text-xs outline-none"
            style={{ borderColor: "var(--color-border-strong)", background: "var(--color-bg)", color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={lookupState.loading}
            className="flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {lookupState.loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
          </button>
        </div>
        {lookupState.error && <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-risk-high)" }}>{lookupState.error}</p>}
      </form>
    </div>
  );
}
