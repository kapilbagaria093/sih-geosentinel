import { jsPDF } from "jspdf";

const RISK_LABEL = { low: "Low", moderate: "Moderate", high: "Critical / High" };

// Builds and downloads a same-day hazard bulletin PDF from data already
// loaded into the dashboard. This is generated entirely client-side (there
// is no /bulletins endpoint on the backend) by summarizing the same figures
// visible on screen: district risk levels, rainfall, and any incidents in
// the currently loaded feed.
export function generateHazardBulletin({ districts, riskByDistrict, weather, reports, generatedAt }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 56;

  doc.setFillColor(11, 42, 74); // navy
  doc.rect(0, 0, 595, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GeoSentinel — Daily Hazard Bulletin", marginX, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Landslide Risk Management Portal — North Eastern Region (NER)", marginX, 52);

  y = 90;
  doc.setTextColor(20, 30, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, marginX, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("District Risk Summary", marginX, y);
  y += 8;
  doc.setDrawColor(215, 222, 228);
  doc.line(marginX, y, 547, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  districts.forEach((d) => {
    const risk = riskByDistrict[d.id] || { level: "low", confirmedEvents: 0 };
    doc.setFont("helvetica", "bold");
    doc.text(d.name, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${RISK_LABEL[risk.level]} risk  \u2014  ${risk.confirmedEvents} confirmed historical event(s)`,
      marginX + 140,
      y
    );
    y += 18;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Rainfall & Weather", marginX, y);
  y += 8;
  doc.line(marginX, y, 547, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (weather) {
    doc.text(`24-hour cumulative rainfall: ${weather.cumulative24hRainfallMm} mm`, marginX, y);
    y += 16;
    doc.text(`Current temperature: ${Math.round(weather.temperatureC)}\u00B0C`, marginX, y);
    y += 16;
  } else {
    doc.text("Weather data unavailable at time of generation.", marginX, y);
    y += 16;
  }

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Reported Incidents", marginX, y);
  y += 8;
  doc.line(marginX, y, 547, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!reports || reports.length === 0) {
    doc.text("No incidents currently on record for this view.", marginX, y);
    y += 16;
  } else {
    reports.slice(0, 12).forEach((r) => {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${r.severity.replace("_", " ")}`, marginX, y);
      doc.setFont("helvetica", "normal");
      const desc = doc.splitTextToSize(r.description || "", 440);
      doc.text(desc, marginX + 90, y);
      y += 16 * Math.max(1, desc.length);
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 130, 140);
  doc.text(
    "This bulletin is generated automatically from data currently loaded in the GeoSentinel dashboard and is not a substitute for official district disaster management advisories.",
    marginX,
    800,
    { maxWidth: 500 }
  );

  const filename = `geosentinel-hazard-bulletin-${generatedAt.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
