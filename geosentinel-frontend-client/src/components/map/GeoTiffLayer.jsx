import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getLayerFileArrayBuffer } from "../../api/layers";
import { decodeGeoTiffToOverlay } from "../../utils/decodeGeoTiff";
import { getCachedOverlay, setCachedOverlay } from "../../utils/geoTiffCache";

// Imperatively manages a single Leaflet ImageOverlay for one raster layer.
// react-leaflet has no first-class raster/GeoTIFF component, so this reaches
// into the underlying Leaflet map via useMap() the same way react-leaflet's
// own components do internally.
export default function GeoTiffLayer({ layerId, visible, opacity, fallbackBounds, onStatusChange }) {
  const map = useMap();
  const overlayRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    onStatusChange?.(layerId, status, meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Load + decode (cached) when first made visible.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function load() {
      let entry = getCachedOverlay(layerId);
      if (!entry) {
        setStatus("loading");
        entry = setCachedOverlay(
          layerId,
          (async () => {
            const buffer = await getLayerFileArrayBuffer(layerId);
            return decodeGeoTiffToOverlay(buffer, layerId, fallbackBounds);
          })()
        );
      }

      try {
        const result = await entry;
        if (cancelled) return;
        setMeta(result);
        setStatus("ready");

        const leafletBounds = L.latLngBounds(
          [result.bounds.south, result.bounds.west],
          [result.bounds.north, result.bounds.east]
        );

        if (!overlayRef.current) {
          overlayRef.current = L.imageOverlay(result.dataUrl, leafletBounds, {
            opacity,
            interactive: false,
            className: "gs-raster-overlay",
          }).addTo(map);
        } else {
          overlayRef.current.setUrl(result.dataUrl);
          overlayRef.current.setBounds(leafletBounds);
          overlayRef.current.addTo(map);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMeta({ error: err.message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, layerId]);

  // Toggle visibility without re-decoding.
  useEffect(() => {
    if (!overlayRef.current) return;
    if (visible) {
      if (!map.hasLayer(overlayRef.current)) overlayRef.current.addTo(map);
    } else {
      map.removeLayer(overlayRef.current);
    }
  }, [visible, map]);

  // Opacity changes are cheap — just update the existing overlay.
  useEffect(() => {
    overlayRef.current?.setOpacity(opacity);
  }, [opacity]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
