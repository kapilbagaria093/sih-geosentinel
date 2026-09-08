// Colour ramps used to paint decoded GeoTIFF pixel values onto a canvas.
// Each ramp is a list of [stopPosition(0-1), [r,g,b]] pairs; interpolateStops
// linearly blends between the two nearest stops.

function interpolateStops(t, stops) {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (clamped >= p0 && clamped <= p1) {
      const localT = p1 === p0 ? 0 : (clamped - p0) / (p1 - p0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * localT),
        Math.round(c0[1] + (c1[1] - c0[1]) * localT),
        Math.round(c0[2] + (c1[2] - c0[2]) * localT),
      ];
    }
  }
  return stops[stops.length - 1][1];
}

const RAMPS = {
  dem: [
    [0, [39, 96, 62]], // low valleys — deep green
    [0.35, [130, 168, 79]],
    [0.55, [214, 191, 104]],
    [0.75, [156, 110, 73]],
    [1, [250, 250, 250]], // peaks — snow
  ],
  slope: [
    [0, [30, 142, 62]], // gentle — matches risk-low
    [0.4, [214, 190, 60]],
    [0.7, [225, 147, 15]], // matches risk-moderate
    [1, [179, 38, 30]], // steep — matches risk-high
  ],
  ndvi: [
    [0, [140, 99, 62]], // bare soil / no vegetation
    [0.3, [206, 189, 102]],
    [0.55, [156, 189, 84]],
    [1, [33, 110, 57]], // dense vegetation
  ],
  "soil-moisture": [
    [0, [216, 196, 150]], // dry
    [0.5, [140, 179, 196]],
    [1, [26, 88, 156]], // saturated
  ],
  "landslide-risk": [
    [0, [30, 142, 62]], // low
    [0.45, [214, 190, 60]],
    [0.7, [225, 147, 15]], // moderate
    [1, [179, 38, 30]], // critical / high
  ],
};

// Aspect is directional (0-360deg), not a magnitude, so it gets a cyclic
// hue wheel instead of a linear ramp.
function aspectColor(valueDeg) {
  const hue = ((valueDeg % 360) + 360) % 360;
  return hslToRgb(hue / 360, 0.55, 0.5);
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Returns an [r, g, b] triple for a raw pixel value given the layer id and
// the observed min/max of the raster (used to normalize everything except
// aspect, which has a fixed 0-360 domain).
export function getRampColor(layerId, value, min, max) {
  if (layerId === "aspect") return aspectColor(value);
  const ramp = RAMPS[layerId] || RAMPS.dem;
  const range = max - min || 1;
  const t = (value - min) / range;
  return interpolateStops(t, ramp);
}

export const RISK_BANDS = [
  { level: "low", label: "Low", max: 0.4, color: "var(--color-risk-low)" },
  { level: "moderate", label: "Moderate", max: 0.7, color: "var(--color-risk-moderate)" },
  { level: "high", label: "Critical / High", max: 1, color: "var(--color-risk-high)" },
];

export function riskLevelForValue(value) {
  if (value >= 0.7) return "high";
  if (value >= 0.4) return "moderate";
  return "low";
}

export const LAYER_LEGEND_STOPS = {
  dem: { unitLabel: "metres", low: "Low elevation", high: "High elevation" },
  slope: { unitLabel: "degrees", low: "Gentle (0°)", high: "Steep (90°)" },
  ndvi: { unitLabel: "index", low: "Bare / sparse", high: "Dense vegetation" },
  "soil-moisture": { unitLabel: "index", low: "Dry", high: "Saturated" },
  aspect: { unitLabel: "degrees", low: "N \u2192 E \u2192 S \u2192 W", high: "" },
  "landslide-risk": { unitLabel: "probability", low: "Low risk", high: "Critical risk" },
};
