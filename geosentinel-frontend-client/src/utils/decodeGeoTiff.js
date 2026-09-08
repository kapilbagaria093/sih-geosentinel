import { fromArrayBuffer } from "geotiff";
import { getRampColor } from "./colorScales";

const MAX_DIMENSION = 900; // cap canvas size for prototype-grade performance

// Decodes a single-band GeoTIFF ArrayBuffer into a coloured PNG data URL,
// ready to hand to Leaflet as an L.imageOverlay.
//
// Returns: { dataUrl, bounds: [[south, west], [north, east]], min, max }
export async function decodeGeoTiffToOverlay(arrayBuffer, layerId, fallbackBounds) {
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const nativeWidth = image.getWidth();
  const nativeHeight = image.getHeight();
  const scale = Math.min(1, MAX_DIMENSION / Math.max(nativeWidth, nativeHeight));
  const width = Math.max(1, Math.round(nativeWidth * scale));
  const height = Math.max(1, Math.round(nativeHeight * scale));

  const rasters = await image.readRasters({ width, height });
  const band = rasters[0];

  let noData = image.getGDALNoData();
  if (noData === undefined) noData = null;

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < band.length; i++) {
    const v = band[i];
    if (v === noData || Number.isNaN(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < band.length; i++) {
    const v = band[i];
    const offset = i * 4;
    if (v === noData || Number.isNaN(v)) {
      imageData.data[offset + 3] = 0; // transparent
      continue;
    }
    const [r, g, b] = getRampColor(layerId, v, min, max);
    imageData.data[offset] = r;
    imageData.data[offset + 1] = g;
    imageData.data[offset + 2] = b;
    imageData.data[offset + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  let bounds = fallbackBounds;
  try {
    const bbox = image.getBoundingBox(); // [west, south, east, north] — assumes EPSG:4326
    if (bbox && bbox.every(Number.isFinite)) {
      bounds = { west: bbox[0], south: bbox[1], east: bbox[2], north: bbox[3] };
    }
  } catch {
    // Fall back to the provided bounds (e.g. district extent) if the raster
    // has no embedded geo-referencing we can read.
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    bounds,
    min,
    max,
  };
}
