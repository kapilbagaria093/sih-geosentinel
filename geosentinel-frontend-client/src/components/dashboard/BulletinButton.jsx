import { FileDown } from "lucide-react";
import { generateHazardBulletin } from "../../utils/bulletin";

export default function BulletinButton({ districts, riskByDistrict, weather, reports }) {
  function handleDownload() {
    generateHazardBulletin({
      districts,
      riskByDistrict,
      weather,
      reports,
      generatedAt: new Date(),
    });
  }

  return (
    <button
      onClick={handleDownload}
      className="flex w-full items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--color-navy)" }}
    >
      <FileDown size={16} />
      Download Daily Hazard Bulletin (PDF)
    </button>
  );
}
