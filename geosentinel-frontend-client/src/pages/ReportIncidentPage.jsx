import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, UploadCloud, X, CheckCircle2, LogIn, MapPin } from "lucide-react";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
import AuthModal from "../components/common/AuthModal";
import LocationPicker from "../components/map/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { useDistricts } from "../hooks/useDistricts";
import { submitReport } from "../api/reports";

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Minor Debris" },
  { value: "road_blocked", label: "Road Blocked" },
  { value: "major", label: "Major Slope Failure" },
];

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function nowLocalDatetime() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function ReportIncidentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { center } = useDistricts();

  const [severity, setSeverity] = useState("minor");
  const [description, setDescription] = useState("");
  const [reportedAt, setReportedAt] = useState(nowLocalDatetime());
  const [location, setLocation] = useState({ latitude: center[0], longitude: center[1] });
  const [altitude, setAltitude] = useState("");
  const [address, setAddress] = useState("");
  const [media, setMedia] = useState([]);
  const [mediaError, setMediaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function handleFilePick(e) {
    setMediaError("");
    const files = Array.from(e.target.files || []);
    const next = [...media];
    for (const file of files) {
      if (next.length >= MAX_FILES) {
        setMediaError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (!ALLOWED_MIME.includes(file.type)) {
        setMediaError(`Unsupported file type: ${file.type || file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setMediaError(`${file.name} exceeds the 100MB limit.`);
        continue;
      }
      next.push({
        file,
        fileName: file.name,
        mimeType: file.type,
        kind: file.type.startsWith("video") ? "video" : "image",
        previewUrl: URL.createObjectURL(file),
      });
    }
    setMedia(next);
    e.target.value = "";
  }

  function removeMedia(index) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (description.length > 2000) {
      setError("Description must be under 2000 characters.");
      return;
    }
    if (
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      setError("Select a valid location on the map.");
      return;
    }

    setSubmitting(true);
    setProgress(0);
    try {
      const res = await submitReport(
        {
          severity,
          description,
          reportedAt: new Date(reportedAt).toISOString(),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            altitude: altitude ? Number(altitude) : null,
            address: address || null,
          },
          media,
        },
        {
          onUploadProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: "var(--color-bg)" }}>
        <Logo size={40} withWordmark />
        <p className="max-w-sm text-sm" style={{ color: "var(--color-text-muted)" }}>
          You need to verify your phone number before submitting an incident report.
        </p>
        <SignInGate onSuccess={() => {}} />
        <Link to="/" className="text-xs underline" style={{ color: "var(--color-accent)" }}>Back to home</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: "var(--color-bg)" }}>
        <CheckCircle2 size={48} style={{ color: "var(--color-risk-low)" }} />
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Report Submitted</h1>
        <p className="max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
          Your incident report has been recorded with ID <code className="font-mono">{result.id}</code>.
          {result.media?.length > 0 && ` ${result.media.length} media file(s) uploaded.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-sm px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            View Dashboard
          </button>
          <button
            onClick={() => {
              setResult(null);
              setDescription("");
              setMedia([]);
            }}
            className="rounded-sm border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text)" }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <header
        className="flex items-center justify-between border-b px-4 py-3 sm:px-6"
        style={{ background: "var(--color-navy)", borderColor: "var(--color-navy-deep)" }}
      >
        <Link to="/dashboard"><Logo size={30} withWordmark /></Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Report a Landslide Incident</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Submit a field observation. Your report will be reviewed alongside sensor data for the affected district.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Field label="Severity">
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSeverity(opt.value)}
                  className="rounded-sm border px-2 py-2.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: severity === opt.value ? "var(--color-accent)" : "var(--color-border-strong)",
                    background: severity === opt.value ? "var(--color-navy-tint)" : "var(--color-surface)",
                    color: "var(--color-text)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Description (${description.length}/2000)`}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              rows={4}
              placeholder="Describe what you observed — extent, road impact, visible cracks, etc."
              className="w-full rounded-sm border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--color-border-strong)", background: "var(--color-surface)", color: "var(--color-text)" }}
            />
          </Field>

          <Field label="Location (tap the map to set the point)">
            <LocationPicker center={center} value={location} onChange={(l) => setLocation((prev) => ({ ...prev, ...l }))} />
            <p className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              <MapPin size={12} /> {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Altitude (m, optional)">
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                className="w-full rounded-sm border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "var(--color-border-strong)", background: "var(--color-surface)", color: "var(--color-text)" }}
              />
            </Field>
            <Field label="Reported at">
              <input
                type="datetime-local"
                value={reportedAt}
                onChange={(e) => setReportedAt(e.target.value)}
                className="w-full rounded-sm border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "var(--color-border-strong)", background: "var(--color-surface)", color: "var(--color-text)" }}
              />
            </Field>
          </div>

          <Field label="Address / landmark (optional)">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. NH10 near Rangpo checkpoint"
              className="w-full rounded-sm border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--color-border-strong)", background: "var(--color-surface)", color: "var(--color-text)" }}
            />
          </Field>

          <Field label={`Photos / videos (${media.length}/${MAX_FILES})`}>
            <label
              className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed px-4 py-6 text-center text-xs"
              style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text-muted)" }}
            >
              <UploadCloud size={20} />
              Click to add images or videos (JPEG, PNG, WEBP, MP4, MOV, WEBM — up to 100MB each)
              <input type="file" accept={ALLOWED_MIME.join(",")} multiple onChange={handleFilePick} className="hidden" />
            </label>
            {mediaError && <p className="mt-1.5 text-xs" style={{ color: "var(--color-risk-high)" }}>{mediaError}</p>}
            {media.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {media.map((m, i) => (
                  <div key={i} className="relative overflow-hidden rounded-sm border" style={{ borderColor: "var(--color-border)" }}>
                    {m.kind === "image" ? (
                      <img src={m.previewUrl} alt={m.fileName} className="h-16 w-full object-cover" />
                    ) : (
                      <div className="flex h-16 w-full items-center justify-center text-[10px]" style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                        {m.fileName}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                      aria-label={`Remove ${m.fileName}`}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {error && (
            <p className="rounded-sm border px-3 py-2 text-sm" style={{ borderColor: "var(--color-risk-high)", background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {error}
            </p>
          )}

          {submitting && (
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-border)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--color-accent)" }} />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Submit Report
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text)" }}>{label}</label>
      {children}
    </div>
  );
}

function SignInGate() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--color-accent)" }}
      >
        <LogIn size={16} />
        Verify Phone Number
      </button>
      <AuthModal open={open} intent="report" onClose={() => setOpen(false)} onVerified={() => navigate(0)} />
    </>
  );
}
