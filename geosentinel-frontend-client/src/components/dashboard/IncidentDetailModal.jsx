import Modal from "../common/Modal";
import { SeverityBadge } from "../common/Badges";
import { MapPin, Clock, Layers as LayersIcon } from "lucide-react";

export default function IncidentDetailModal({ report, onClose }) {
  if (!report) return null;

  return (
    <Modal open={Boolean(report)} onClose={onClose} title="Incident Report Details" maxWidthClass="max-w-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SeverityBadge severity={report.severity} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>ID: {report.id}</span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{report.description}</p>

        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2" style={{ color: "var(--color-text-muted)" }}>
          <p className="flex items-center gap-1.5">
            <MapPin size={13} />
            {report.location?.latitude?.toFixed(4)}, {report.location?.longitude?.toFixed(4)}
          </p>
          {report.location?.address && (
            <p className="flex items-center gap-1.5">
              <LayersIcon size={13} />
              {report.location.address}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Clock size={13} />
            Reported {new Date(report.reportedAt).toLocaleString()}
          </p>
          {report.location?.altitude != null && (
            <p>Altitude: {report.location.altitude} m</p>
          )}
        </div>

        {report.media?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Attached Media ({report.media.length})
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {report.media.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-sm border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {m.kind === "image" ? (
                    <img src={m.url} alt={m.fileName} className="h-20 w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-20 w-full items-center justify-center text-[11px]"
                      style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}
                    >
                      Video: {m.fileName}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
