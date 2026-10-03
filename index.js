import * as maplibregl from "https://unpkg.com/maplibre-gl@^6.11.2/dist/maplibre-gl.mjs";

const HOME_VIEW = {
  center: [125.6, 7.4],
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const map = new maplibregl.Map({
  container: "map",

  attributionControl: false,

  style: {
    version: 8,

    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },

      terrainSource: {
        type: "raster-dem",
        tiles: [
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        encoding: "terrarium",
        maxzoom: 15,
      },
    },

    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm",
      },
    ],
  },

  center: HOME_VIEW.center,
  zoom: HOME_VIEW.zoom,
  pitch: HOME_VIEW.pitch,
  bearing: HOME_VIEW.bearing,
});

map.addControl(
  new maplibregl.NavigationControl({
    showZoom: true,
    showCompass: true,
  }),
  "top-right",
);

const geolocate = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  },

  trackUserLocation: true,
  showUserLocation: true,
  showAccuracyCircle: false,
  showUserHeading: true,

  fitBoundsOptions: {
    maxZoom: 18,
  },
});

map.addControl(geolocate, "top-right");

class HomeControl {
  onAdd(map) {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.title = "Return to project";

    this.button.innerHTML = `
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 11L12 3L21 11"></path>
        <path d="M5 10V21H19V10"></path>
        <path d="M9 21V14H15V21"></path>
      </svg>
    `;

    this.button.addEventListener("click", () => {
      map.easeTo({
        center: HOME_VIEW.center,
        zoom: HOME_VIEW.zoom,
        pitch: HOME_VIEW.pitch,
        bearing: HOME_VIEW.bearing,
        duration: 1000,
      });
    });

    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove() {
    this.container.remove();
    this.map = undefined;
  }
}

class ThreeDControl {
  onAdd(map) {
    this.map = map;
    this.is3D = false;

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.title = "Enable 3D terrain";
    this.button.textContent = "3D";

    this.button.addEventListener("click", () => {
      this.is3D = !this.is3D;

      if (this.is3D) {
        map.setTerrain({
          source: "terrainSource",
          exaggeration: 1.5,
        });

        map.easeTo({
          pitch: 65,
          bearing: -20,
          duration: 1000,
        });

        this.button.textContent = "2D";
        this.button.title = "Switch to 2D";
      } else {
        map.setTerrain(null);

        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000,
        });

        this.button.textContent = "3D";
        this.button.title = "Enable 3D terrain";
      }
    });

    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove() {
    this.container.remove();
    this.map = undefined;
  }
}

map.addControl(new HomeControl(), "top-right");
map.addControl(new ThreeDControl(), "top-right");

geolocate.on("geolocate", (event) => {
  const { latitude, longitude, accuracy } = event.coords;

  console.log("GPS Location");
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  console.log("Accuracy:", `${Math.round(accuracy)} meters`);
});

geolocate.on("error", (error) => {
  console.error("GPS error:", error.message);
});
