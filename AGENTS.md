# Repository guidance

## Purpose

This repository is a dependency-light, vanilla JavaScript interactive master-plan viewer. Preserve the no-build-step approach unless a task explicitly requires a toolchain.

## Architecture

- `index.html` is the semantic application shell.
- `index.js` initializes the application and wires modules together.
- `js/config.js` contains project-specific branding, views, sources, and layer configuration.
- `js/controls.js` contains reusable MapLibre controls.
- `styles.css` owns global, map-control, and responsive presentation.
- `data/` stores local project assets and future spatial data.

Keep project data and configuration separate from map behavior. Prefer small ES modules with named exports. Do not introduce a framework for changes that vanilla DOM and MapLibre APIs can handle clearly.

## Development

Serve the repository through a local web server:

```bash
python3 -m http.server 8000
```

Do not validate ES modules by opening `index.html` using `file://`. Test at desktop and mobile widths, including a short landscape viewport. Check that home, GPS, zoom, compass, and 2D/3D controls remain keyboard accessible.

## Data and maps

- Put deployment-specific values in `js/config.js` rather than hard-coding them in controls.
- Use GeoJSON for small datasets; prefer tiled raster/vector sources for large drawings or site data.
- Retain all required map-data attribution.
- Treat source and layer IDs as stable API names and keep them unique.
- Avoid committing secrets, access tokens, private client data, or very large raw survey files.

## Offline constraints

Do not describe the default application as offline-ready while it uses CDN modules or remote map/terrain tiles. A fully offline change must vendor MapLibre assets, use local tiles/data, and serve or cache them locally. GPS availability is separate from map-tile availability.

## Change checks

- Keep changes responsive and touch-friendly.
- Add accessible names to icon-only controls and preserve visible focus states.
- Confirm the browser console has no new errors.
- Update `README.md` when setup, data format, external services, or offline behavior changes.
