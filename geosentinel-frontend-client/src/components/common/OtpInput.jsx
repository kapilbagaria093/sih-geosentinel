import { useRef } from "react";

export default function OtpInput({ length = 6, value, onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  function updateDigit(index, digit) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleChange(e, index) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      updateDigit(index, "");
      return;
    }
    // Handle paste-into-single-box: spread remaining digits across boxes.
    const chars = raw.split("");
    const next = digits.slice();
    for (let i = 0; i < chars.length && index + i < length; i++) {
      next[index + i] = chars[i];
    }
    onChange(next.join(""));
    const targetIndex = Math.min(index + chars.length, length - 1);
    inputsRef.current[targetIndex]?.focus();
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="One-time password">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-10 rounded-sm border text-center text-lg font-semibold outline-none transition-colors focus:border-transparent sm:w-11"
          style={{
            borderColor: "var(--color-border-strong)",
            background: "var(--color-bg)",
            color: "var(--color-text)",
          }}
        />
      ))}
    </div>
  );
}
