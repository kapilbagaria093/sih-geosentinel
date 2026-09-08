import { Sun, Moon, CircleDot } from "lucide-react";
import { useTheme, THEMES } from "../../context/ThemeContext";

const ICONS = {
  light: Sun,
  dark: Moon,
  hc: CircleDot,
};

export default function ThemeToggle({ variant = "onNavy" }) {
  const { theme, setTheme } = useTheme();
  const isOnNavy = variant === "onNavy";

  return (
    <div
      role="radiogroup"
      aria-label="Display theme"
      className="flex items-center gap-0.5 rounded-sm border p-0.5"
      style={{
        borderColor: isOnNavy ? "rgba(255,255,255,0.25)" : "var(--color-border)",
        background: isOnNavy ? "rgba(255,255,255,0.06)" : "var(--color-surface)",
      }}
    >
      {THEMES.map((t) => {
        const Icon = ICONS[t.id];
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={active}
            title={t.label}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-1.5 rounded-[3px] px-2 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: active ? "var(--color-accent)" : "transparent",
              color: active ? "#ffffff" : isOnNavy ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)",
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
