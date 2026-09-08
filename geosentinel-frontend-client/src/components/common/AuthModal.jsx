import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import Modal from "./Modal";
import OtpInput from "./OtpInput";
import { signUp, requestSignInOtp, verifySignInOtp } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const OTP_LENGTH = 6; // backend examples ("123456") are 6-digit, not the 4-digit mock in the design brief

const INTENT_COPY = {
  report: {
    title: "Sign In to Report an Incident",
    verifiedNote: "You're verified — continue to the incident report form.",
  },
  alert: {
    title: "Sign In to Subscribe to Alerts",
    verifiedNote: "You're verified — choose the districts you'd like updates for.",
  },
};

export default function AuthModal({ open, intent = "report", onClose, onVerified }) {
  const { completeSignIn } = useAuth();
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState(null);

  const copy = INTENT_COPY[intent] || INTENT_COPY.report;

  function reset() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError("");
    setDevOtp(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose?.();
  }

  function fullPhone() {
    return `+91${phone.replace(/\D/g, "")}`;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({ phoneNumber: fullPhone() });
      setDevOtp(result.otp || null);
      setStep("otp");
    } catch (err) {
      if (err.message?.toLowerCase().includes("already exists")) {
        try {
          await requestSignInOtp({ phoneNumber: fullPhone() });
          setStep("otp");
        } catch (innerErr) {
          setError(innerErr.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    if (otp.replace(/\D/g, "").length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code sent to your phone.`);
      return;
    }
    setLoading(true);
    try {
      const result = await verifySignInOtp({ phoneNumber: fullPhone(), otp });
      completeSignIn(result);
      onVerified?.(result.user);
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={copy.title}>
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Mobile number
            </label>
            <div
              className="flex items-center overflow-hidden rounded-sm border"
              style={{ borderColor: "var(--color-border-strong)" }}
            >
              <span
                className="border-r px-3 py-2.5 text-sm font-medium"
                style={{ borderColor: "var(--color-border-strong)", background: "var(--color-navy-tint)", color: "var(--color-text)" }}
              >
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                style={{ color: "var(--color-text)", background: "var(--color-bg)" }}
                autoFocus
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium" style={{ color: "var(--color-risk-high)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Send OTP
          </button>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            By continuing, you agree to receive a one-time password via SMS for identity verification.
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Enter the {OTP_LENGTH}-digit code sent to <strong style={{ color: "var(--color-text)" }}>+91 {phone}</strong>.
          </p>

          {devOtp && (
            <div
              className="rounded-sm border px-3 py-2 text-xs"
              style={{ borderColor: "var(--color-risk-moderate)", background: "var(--color-risk-moderate-bg)", color: "var(--color-risk-moderate)" }}
            >
              Development mode: backend returned test OTP <strong>{devOtp}</strong> (this will be removed once real SMS delivery is live).
            </div>
          )}

          <OtpInput length={OTP_LENGTH} value={otp} onChange={setOtp} disabled={loading} />

          {error && <p className="text-center text-sm font-medium" style={{ color: "var(--color-risk-high)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Verify &amp; Proceed
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            Use a different number
          </button>
        </form>
      )}
    </Modal>
  );
}
