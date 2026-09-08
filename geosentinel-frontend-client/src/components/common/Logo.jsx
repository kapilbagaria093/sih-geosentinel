export default function Logo({ size = 32, withWordmark = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="GeoSentinel emblem"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="14" fill="var(--color-navy)" />
        <path d="M8 46 L22 26 L32 36 L40 27 L58 46 L58 51 L8 51 Z" fill="var(--color-navy-tint)" opacity="0.35" />
        <path d="M8 48 L20 32 L30 40 L38 33 L58 48 L58 51 L8 51 Z" fill="var(--color-text-on-navy)" opacity="0.9" />
        <circle cx="45" cy="18" r="10" fill="var(--color-risk-high, #C22B2B)" />
        <path
          d="M45 12.5 V18 L48.5 21"
          stroke="var(--color-text-on-navy)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
            GeoSentinel
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            NER Landslide Portal
          </span>
        </span>
      )}
    </div>
  );
}
