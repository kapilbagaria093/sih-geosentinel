export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-navy)" }}>
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs sm:px-6" style={{ color: "var(--color-text-on-navy)", opacity: 0.75 }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} GeoSentinel &middot; NER Landslide Risk Management Portal. Prototype build for Sikkim.</p>
          <p>Data sources: satellite raster layers, ground sensors, and citizen-reported observations.</p>
        </div>
      </div>
    </footer>
  );
}
