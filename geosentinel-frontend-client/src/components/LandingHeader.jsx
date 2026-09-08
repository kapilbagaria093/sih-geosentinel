import { PhoneCall } from "lucide-react";
import Logo from "./common/Logo";
import ThemeToggle from "./common/ThemeToggle";

export default function LandingHeader() {
  return (
    <header style={{ background: "var(--color-navy)" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div className="hidden leading-tight sm:block">
            <p className="text-[15px] font-bold" style={{ color: "var(--color-text-on-navy)" }}>
              Landslide Risk Management Portal
            </p>
            <p className="text-[12px] font-medium" style={{ color: "var(--color-text-on-navy)", opacity: 0.75 }}>
              North Eastern Region (NER) &middot; Government of India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:1070"
            className="flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10"
            style={{ borderColor: "var(--color-risk-high)", background: "rgba(194,43,30,0.18)", color: "#fff" }}
          >
            <PhoneCall size={13} />
            Helpline: 1070
          </a>
          <ThemeToggle />
        </div>
      </div>
      <div className="tricolor-stripe" />
    </header>
  );
}
