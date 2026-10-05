import * as maplibregl from "https://unpkg.com/maplibre-gl@^6.11.2/dist/maplibre-gl.mjs";
import { APP_CONFIG, createMapStyle } from "./js/config.js";
import {
  BasemapControl,
  GPSControl,
  HomeControl,
  ThreeDControl,
} from "./js/controls.js";

function applyBranding({ name, logo }) {
  document.title = `${name} · Interactive Master Plan`;
  document.querySelector("[data-company-name]").textContent = name;
  for (const image of document.querySelectorAll("[data-company-logo]")) {
    image.src = logo;
    image.alt = `${name} logo`;
  }
}

function createMap() {
  const { homeView, map: options } = APP_CONFIG;
  return new maplibregl.Map({
    container: "map",
    attributionControl: true,
    style: createMapStyle(),
    ...homeView,
    minZoom: options.minZoom,
    maxZoom: options.maxZoom,
  });
}

function addControls(map) {
  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new GPSControl(maplibregl), "top-right");
  map.addControl(new HomeControl(APP_CONFIG.homeView), "top-right");
  map.addControl(
    new ThreeDControl({ exaggeration: APP_CONFIG.map.terrainExaggeration }),
    "top-right",
  );
  map.addControl(
    new BasemapControl({
      basemaps: APP_CONFIG.basemaps,
      defaultBasemap: APP_CONFIG.defaultBasemap,
    }),
    "top-right",
  );
}

applyBranding(APP_CONFIG.branding);
const map = createMap();
addControls(map);
map.once("load", () => document.body.classList.add("map-ready"));
