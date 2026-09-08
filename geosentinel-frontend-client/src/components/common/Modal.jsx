import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidthClass = "max-w-md" }) {
  const dialogRef = useRef(null);

  // Focus the dialog and lock body scroll only when the modal actually
  // opens/closes — this must NOT depend on `onClose`, because parent
  // components typically pass a fresh inline function on every render
  // (e.g. every keystroke in a form inside the modal). If `onClose` were a
  // dependency here, that re-render would re-run this effect and call
  // `.focus()` again, yanking focus away from whatever input the person
  // was typing into after every single character.
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // The Escape-key handler can safely depend on `onClose` — re-registering
  // a document listener on every render has no effect on input focus.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`gs-animate-in relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-sm border shadow-xl outline-none`}
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-sm p-1.5 transition-colors hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
