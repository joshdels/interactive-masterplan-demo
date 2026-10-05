# Interactive Master Plan

A lightweight, responsive master-plan viewer built with vanilla JavaScript and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/). It provides a basemap gallery, 2D/3D terrain switching, a project home view, and browser geolocation.

## Run locally

ES modules must be served over HTTP; opening `index.html` directly with `file://` is not supported.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Geolocation works on `localhost`; deployed sites must use HTTPS.

## Project structure

```text
.
├── data/               Project images and future spatial data
├── js/
│   ├── config.js       Branding, initial view, map sources, and project layers
│   └── controls.js     Reusable GPS, home, and 3D controls
├── index.html          Application shell
├── index.js            Map initialization
└── styles.css          Layout and responsive styling
```

## Customize it

Edit `js/config.js` to change the company name, logo, starting coordinates, zoom, basemaps, map sources, or terrain exaggeration. The `basemaps` array currently supplies Blank, Google Satellite Hybrid, and OpenStreetMap choices. Add another entry with a unique `id`, label, thumbnail class, and raster source to extend the gallery. Add future GeoJSON, raster, or vector-tile definitions to `sources` and their MapLibre layer definitions to `projectLayers`. Large datasets should use vector or raster tiles instead of one large GeoJSON file.

The included Google raster URL is a public web tile endpoint, not an authenticated Google Maps Platform integration. Confirm that its use and attribution meet Google's current terms before production deployment; replace it with an approved provider URL or official integration when required.

For a georeferenced master-plan image, export the drawing as a georeferenced raster/tile set, then add it as a MapLibre raster source and layer. Keep source and layer IDs unique.

## Offline use

The architecture can run offline, but the current demo cannot: it downloads MapLibre from unpkg and requests basemap and elevation tiles from internet services.

For a fully offline deployment:

1. Download MapLibre's JavaScript, CSS, fonts, and sprites into the repository and change the imports in `index.html` and `index.js` to local paths.
2. Package basemap, master-plan, and terrain tiles locally, or serve them from a local-network tile server.
3. Update the URLs in `js/config.js` to point to those local resources.
4. Use a local HTTP server or install the site as a PWA; do not open it with `file://`.
5. Pre-cache all required files with a service worker if offline use must continue after the local server is unavailable.

GPS can work without internet when the device and browser provide a position, although device behavior varies. Map display still requires locally available tiles.

## Browser notes

- Designed for current Chrome, Edge, Firefox, and Safari releases.
- Mobile controls become smaller below 480 px and in short landscape viewports.
- Location requires user permission and a secure context (`https://` or `localhost`).
- OpenStreetMap attribution must remain visible when its tiles are used.

## License

See [LICENSE](LICENSE).
