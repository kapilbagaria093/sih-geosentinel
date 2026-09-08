import { useState } from "react";
import { Loader2, BellRing, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import { useDistricts } from "../../hooks/useDistricts";
import { registerForAlerts } from "../../api/alerts";
import { useAuth } from "../../context/AuthContext";

export default function AlertSubscriptionModal({ open, onClose }) {
  const { districts } = useDistricts();
  const { user } = useAuth();
  const [selected, setSelected] = useState(() => new Set(districts.map((d) => d.id)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { queued: boolean }

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleClose() {
    setResult(null);
    setError("");
    onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (selected.size === 0) {
      setError("Select at least one district.");
      return;
    }
    setLoading(true);
    try {
      await registerForAlerts({
        phoneNumber: user?.phoneNumber,
        districtIds: Array.from(selected),
      });
      setResult({ queued: false });
    } catch (err) {
      if (err.notImplemented) {
        setResult({ queued: true });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Subscribe to Landslide Alerts">
      {result ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={40} style={{ color: "var(--color-risk-low)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {result.queued
              ? "Your preferences were saved locally. Live SMS alerts aren't wired up on the server yet — this will start working automatically once /alerts/register ships."
              : "You're subscribed. We'll text updates to your registered number as hazard conditions change."}
          </p>
          <button
            onClick={handleClose}
            className="mt-2 rounded-sm px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Receive SMS updates at <strong style={{ color: "var(--color-text)" }}>{user?.phoneNumber}</strong> for the
            districts you choose below.
          </p>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Districts
            </legend>
            {districts.map((d) => (
              <label
                key={d.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-sm border px-3 py-2.5 text-sm"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                  className="h-4 w-4"
                />
                <span style={{ color: "var(--color-text)" }}>{d.name}</span>
              </label>
            ))}
          </fieldset>

          {error && <p className="text-sm font-medium" style={{ color: "var(--color-risk-high)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
            Confirm Subscription
          </button>
        </form>
      )}
    </Modal>
  );
}
