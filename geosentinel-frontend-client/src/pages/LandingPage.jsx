import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Satellite, ClipboardList, Users, BellRing, ArrowRight } from "lucide-react";
import LandingHeader from "../components/LandingHeader";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import AuthModal from "../components/common/AuthModal";
import AlertSubscriptionModal from "../components/common/AlertSubscriptionModal";
import { useAuth } from "../context/AuthContext";

const MODULES = [
  {
    icon: Satellite,
    title: "Live GIS Monitoring",
    body: "Slope, elevation, vegetation, aspect and soil moisture layers, refreshed from satellite raster data.",
  },
  {
    icon: ClipboardList,
    title: "Historical Landslide Records",
    body: "A curated dataset of confirmed and sampled events used to understand terrain susceptibility.",
  },
  {
    icon: Users,
    title: "Citizen Incident Reporting",
    body: "Verified residents can report blockages and slope failures directly from the field, with photos.",
  },
  {
    icon: BellRing,
    title: "District-Level SMS Alerts",
    body: "Subscribe to the districts you care about and receive updates as conditions change.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authModal, setAuthModal] = useState(null); // 'report' | 'alert' | null
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  function handleLoginToReport() {
    if (isAuthenticated) {
      navigate("/report");
      return;
    }
    setAuthModal("report");
  }

  function handleGetAlert() {
    if (isAuthenticated) {
      setAlertModalOpen(true);
      return;
    }
    setAuthModal("alert");
  }

  function handleVerified() {
    const intent = authModal;
    setAuthModal(null);
    if (intent === "report") navigate("/report");
    if (intent === "alert") setAlertModalOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--color-bg)" }}>
      <LandingHeader />

      <main className="flex-1">
        <HeroSection
          onViewDashboard={() => navigate("/dashboard")}
          onLoginToReport={handleLoginToReport}
          onGetAlert={handleGetAlert}
        />

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              What the portal does
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Four connected modules bring together remote-sensing data and ground reports into one
              operational view of landslide hazard across Sikkim.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="flex flex-col gap-3 rounded-sm border p-5"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-card)" }}
              >
                <m.icon size={20} style={{ color: "var(--color-accent)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{m.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-navy-tint)" }}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                Already tracking a slope in your district?
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Open the live dashboard to see current risk zones, rainfall, and reported blockages.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--color-navy)" }}
            >
              Open Dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        open={Boolean(authModal)}
        intent={authModal || "report"}
        onClose={() => setAuthModal(null)}
        onVerified={handleVerified}
      />
      <AlertSubscriptionModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
    </div>
  );
}
