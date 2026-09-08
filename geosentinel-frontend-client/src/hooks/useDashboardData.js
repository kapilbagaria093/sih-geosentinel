import { useCallback, useEffect, useState } from "react";
import { getLayers } from "../api/layers";
import { getLandslides } from "../api/landslides";
import { listReports } from "../api/reports";
import { clearOverlayCache } from "../utils/geoTiffCache";

const initialState = {
  layers: { data: [], loading: true, error: null },
  landslides: { data: [], loading: true, error: null },
  reports: { data: [], loading: true, error: null, notImplemented: false },
  lastUpdated: null,
};

export function useDashboardData() {
  const [state, setState] = useState(initialState);

  const load = useCallback(async ({ hardRefresh = false } = {}) => {
    if (hardRefresh) clearOverlayCache();

    setState((prev) => ({
      layers: { ...prev.layers, loading: true, error: null },
      landslides: { ...prev.landslides, loading: true, error: null },
      reports: { ...prev.reports, loading: true, error: null },
      lastUpdated: prev.lastUpdated,
    }));

    const [layersResult, landslidesResult, reportsResult] = await Promise.allSettled([
      getLayers(),
      getLandslides(),
      listReports(),
    ]);

    setState({
      layers:
        layersResult.status === "fulfilled"
          ? { data: layersResult.value.data, loading: false, error: null }
          : { data: [], loading: false, error: layersResult.reason.message },
      landslides:
        landslidesResult.status === "fulfilled"
          ? { data: landslidesResult.value.data, loading: false, error: null }
          : { data: [], loading: false, error: landslidesResult.reason.message },
      reports:
        reportsResult.status === "fulfilled"
          ? {
              data: reportsResult.value.data,
              loading: false,
              error: null,
              notImplemented: reportsResult.value.notImplemented,
            }
          : { data: [], loading: false, error: reportsResult.reason.message, notImplemented: false },
      lastUpdated: new Date(),
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: () => load({ hardRefresh: true }) };
}
