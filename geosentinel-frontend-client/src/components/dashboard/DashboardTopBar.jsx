import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, ClipboardPlus, PhoneCall } from "lucide-react";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import RefreshButton from "./RefreshButton";

export default function DashboardTopBar({
  onRefresh,
  loading,
  lastUpdated,
  isAuthenticated,
  user,
  onLogout,
  onReportIncident,
}) {
  return (
    <header
      className="z-[600] flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5"
      style={{ background: "var(--color-navy)", borderColor: "var(--color-navy-deep)" }}
    >
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-text-on-navy)", opacity: 0.85 }}>
          <ArrowLeft size={14} />
        </Link>
        <Logo size={28} withWordmark />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="tel:1070"
          className="hidden items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold sm:flex"
          style={{ borderColor: "var(--color-risk-high)", background: "rgba(194,43,30,0.18)", color: "#fff" }}
        >
          <PhoneCall size={12} />
          1070
        </a>

        <button
          onClick={onReportIncident}
          className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          <ClipboardPlus size={13} />
          Report Incident
        </button>

        <RefreshButton onRefresh={onRefresh} loading={loading} lastUpdated={lastUpdated} />

        <ThemeToggle />

        {isAuthenticated && (
          <button
            onClick={onLogout}
            title={user?.phoneNumber}
            className="flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-medium"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--color-text-on-navy)" }}
          >
            <LogOut size={13} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
