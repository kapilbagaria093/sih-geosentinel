import { LayoutDashboard, LogIn, BellRing, CloudRain, Mountain, MapPinned } from "lucide-react";
import { useDistricts } from "../hooks/useDistricts";

export default function HeroSection({ onViewDashboard, onLoginToReport, onGetAlert }) {
  const { districts } = useDistricts();

  return (
    <section
      className="border-b"
      style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-16">
        <div>
          <p
            className="mb-3 inline-block rounded-sm border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--color-risk-moderate)", color: "var(--color-risk-moderate)", background: "var(--color-risk-moderate-bg)" }}
          >
            Monsoon Advisory Active &middot; June&ndash;September
          </p>
          <h1
            className="text-3xl font-bold leading-tight sm:text-[2.6rem]"
            style={{ color: "var(--color-text)" }}
          >
            Real-Time Landslide Hazard Monitoring &amp; Early Warning System
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            This portal consolidates satellite terrain data, soil and vegetation indices, and
            ground-reported incidents across Sikkim's steep monsoon-affected terrain. It is
            maintained to support district administrations, road authorities, and residents in
            identifying active hazard zones before and during periods of heavy precipitation.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onViewDashboard}
              className="flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--color-accent)" }}
            >
              <LayoutDashboard size={16} />
              View Live Dashboard
            </button>
            <button
              onClick={onLoginToReport}
              className="flex items-center gap-2 rounded-sm border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
              style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text)" }}
            >
              <LogIn size={16} />
              Login to Report Incident
            </button>
            <button
              onClick={onGetAlert}
              className="flex items-center gap-2 rounded-sm border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
              style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text)" }}
            >
              <BellRing size={16} />
              Get Alert
            </button>
          </div>
        </div>

        <div
          className="gs-animate-in flex flex-col gap-4 rounded-sm border p-5"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Coverage Snapshot &mdash; Sikkim
          </p>
          <div className="grid grid-cols-2 gap-4">
            <StatBlock icon={MapPinned} value={districts.length} label="Districts monitored" />
            <StatBlock icon={Mountain} value="5" label="GIS data layers" />
            <StatBlock icon={CloudRain} value="24h" label="Rainfall refresh window" />
            <StatBlock icon={LayoutDashboard} value="Live" label="Prediction overlay status" />
          </div>
          <div className="rounded-sm border-l-4 px-3 py-2 text-xs" style={{ borderColor: "var(--color-accent)", background: "var(--color-navy-tint)", color: "var(--color-text)" }}>
            Districts covered: {districts.map((d) => d.name).join(", ")}.
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col gap-1">
      <Icon size={16} style={{ color: "var(--color-accent)" }} />
      <span className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{value}</span>
      <span className="text-[11px] leading-tight" style={{ color: "var(--color-text-muted)" }}>{label}</span>
    </div>
  );
}
