/** Project-specific settings. Replace these when real plan data is ready. */
export const APP_CONFIG = {
  branding: { name: "Company Name", logo: "data/logo.png" },
  homeView: { center: [125.6, 7.4], zoom: 10, pitch: 0, bearing: 0 },
  map: { minZoom: 2, maxZoom: 20, terrainExaggeration: 1.5 },
  basemaps: [
    {
      // Keep `id` stable because it is used internally. `label` is safe to edit.
      id: "blank",
      label: "Blank",
      thumbnailClass: "basemap-thumbnail--blank",
    },
    {
      // Keep `id` stable because it is used internally. `label` is safe to edit.
      id: "google",
      label: "Satellite",
      thumbnailClass: "basemap-thumbnail--google-hybrid",
      source: {
        type: "raster",
        tiles: ["https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"],
        tileSize: 256,
        attribution: "© Google",
      },
    },
    {
      // Keep `id` stable because it is used internally. `label` is safe to edit.
      id: "osm",
      label: "Streets",
      thumbnailClass: "basemap-thumbnail--osm",
      source: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
  ],
  defaultBasemap: "osm",
  sources: {
    terrain: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      encoding: "terrarium",
      maxzoom: 15,
    },
  },
  // Add future GeoJSON, raster, or vector-tile layers here.
  projectLayers: [],
};

export function createMapStyle(config = APP_CONFIG) {
  const basemapSources = Object.fromEntries(
    config.basemaps
      .filter(({ source }) => source)
      .map(({ id, source }) => [`basemap-${id}`, source]),
  );
  const basemapLayers = config.basemaps
    .filter(({ source }) => source)
    .map(({ id }) => ({
      id: `basemap-${id}`,
      type: "raster",
      source: `basemap-${id}`,
      layout: {
        visibility: id === config.defaultBasemap ? "visible" : "none",
      },
    }));

  return {
    version: 8,
    sources: { ...config.sources, ...basemapSources },
    layers: [...basemapLayers, ...config.projectLayers],
  };
}
