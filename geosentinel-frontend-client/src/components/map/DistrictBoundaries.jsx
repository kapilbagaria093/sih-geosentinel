import { GeoJSON } from "react-leaflet";
import { useMemo } from "react";

const RISK_LABEL = { low: "Low Risk", moderate: "Moderate Risk", high: "Critical / High Risk" };

const RISK_LINE_COLOR = {
  low: "#1e8e3e",
  moderate: "#b4720a",
  high: "#b3261e",
};

export default function DistrictBoundaries({ geojson, riskByDistrict, selectedDistrictId, onSelectDistrict }) {
  const styleFn = useMemo(
    () => (feature) => {
      const id = feature.properties.dt_code;
      const risk = riskByDistrict?.[id]?.level || "low";
      const isSelected = selectedDistrictId === id;
      return {
        color: RISK_LINE_COLOR[risk],
        weight: isSelected ? 3.5 : 1.75,
        fillColor: RISK_LINE_COLOR[risk],
        fillOpacity: isSelected ? 0.16 : 0.06,
        dashArray: isSelected ? null : "3 3",
      };
    },
    [riskByDistrict, selectedDistrictId]
  );

  function onEachFeature(feature, layer) {
    const id = feature.properties.dt_code;
    const risk = riskByDistrict?.[id];
    const riskLabel = RISK_LABEL[risk?.level || "low"];
    layer.bindTooltip(
      `<strong>${feature.properties.district}</strong><br/>${riskLabel} &middot; ${risk?.confirmedEvents ?? 0} confirmed events`,
      { sticky: true, className: "gs-district-tooltip" }
    );
    layer.on({
      click: () => onSelectDistrict?.(id),
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.22 }),
      mouseout: () => layer.setStyle(styleFn(feature)),
    });
  }

  return (
    <GeoJSON
      key={JSON.stringify(riskByDistrict) + selectedDistrictId}
      data={geojson}
      style={styleFn}
      onEachFeature={onEachFeature}
    />
  );
}
