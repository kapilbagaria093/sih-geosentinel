import { useMemo } from "react";
import sikkimDistrictsRaw from "../data/sikkim.geojson?raw";
import { boundsOfGeoJson, findDistrictForPoint } from "../utils/geo";

const sikkimDistricts = JSON.parse(sikkimDistrictsRaw);

export function useDistricts() {
  return useMemo(() => {
    const districts = sikkimDistricts.features.map((f) => ({
      id: f.properties.dt_code,
      name: f.properties.district,
      state: f.properties.st_nm,
      feature: f,
    }));

    const bounds = boundsOfGeoJson(sikkimDistricts);
    const center = [
      (bounds.south + bounds.north) / 2,
      (bounds.west + bounds.east) / 2,
    ];

    return { geojson: sikkimDistricts, districts, bounds, center };
  }, []);
}

// Buckets historical landslide records (from GET /landslides) into districts
// by point-in-polygon test, then derives a simple three-tier risk level per
// district. This is a transparent, explainable heuristic (not a model
// output) used only until the real predicted-risk raster is available on
// the backend:
//   - riskScore = confirmed landslide events observed in that district
//   - Low: 0-2, Moderate: 3-7, High: 8+
// Thresholds are intentionally simple and documented here so they're easy
// to tune once real data volume is known.
export function computeDistrictRisk(districts, landslideRecords) {
  const counts = Object.fromEntries(districts.map((d) => [d.id, 0]));
  const totals = Object.fromEntries(districts.map((d) => [d.id, 0]));

  for (const rec of landslideRecords) {
    if (!Number.isFinite(rec.longitude) || !Number.isFinite(rec.latitude)) continue;
    const match = findDistrictForPoint(
      [rec.longitude, rec.latitude],
      districts.map((d) => d.feature)
    );
    if (!match) continue;
    const id = match.properties.dt_code;
    totals[id] = (totals[id] || 0) + 1;
    if (rec.landslide === 1) counts[id] = (counts[id] || 0) + 1;
  }

  function levelFor(count) {
    if (count >= 8) return "high";
    if (count >= 3) return "moderate";
    return "low";
  }

  return Object.fromEntries(
    districts.map((d) => [
      d.id,
      {
        confirmedEvents: counts[d.id] || 0,
        samples: totals[d.id] || 0,
        level: levelFor(counts[d.id] || 0),
      },
    ])
  );
}
