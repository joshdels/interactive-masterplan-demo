import * as maplibregl from "https://unpkg.com/maplibre-gl@^6.11.2/dist/maplibre-gl.mjs";

const map = new maplibregl.Map({
  container: "map", // container id
  style: "https://demotiles.maplibre.org/globe.json", // style URL
  center: [0, 0], // starting position [lng, lat]
  zoom: 2, // starting zoom
});