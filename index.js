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

class GPSControl {
  onAdd(map) {
    this.map = map;
    this.watchId = null;
    this.marker = null;
    this.accuracyMarker = null;
    this.tracking = false;
    this.firstPosition = true;

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.title = "Show my location";

    // Location icon
    this.button.innerHTML = `
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <circle cx="12" cy="12" r="8"></circle>
        <path d="M12 2V4"></path>
        <path d="M12 20V22"></path>
        <path d="M2 12H4"></path>
        <path d="M20 12H22"></path>
      </svg>
    `;

    this.button.addEventListener("click", () => {
      if (this.tracking) {
        this.stopTracking();
      } else {
        this.startTracking();
      }
    });

    this.container.appendChild(this.button);

    return this.container;
  }

  startTracking() {
    if (!navigator.geolocation) {
      alert("GPS location is not supported by this browser.");
      return;
    }

    this.button.title = "Locating...";
    this.button.disabled = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log("GPS Location");
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Accuracy:", `${Math.round(accuracy)} meters`);

        const location = [longitude, latitude];

        if (!this.marker) {
          const markerElement = document.createElement("div");

          markerElement.style.width = "18px";
          markerElement.style.height = "18px";
          markerElement.style.borderRadius = "50%";
          markerElement.style.background = "#4285F4";
          markerElement.style.border = "3px solid white";
          markerElement.style.boxShadow = "0 1px 5px rgba(0,0,0,0.5)";

          this.marker = new maplibregl.Marker({
            element: markerElement,
          })
            .setLngLat(location)
            .addTo(this.map);
        } else {
          this.marker.setLngLat(location);
        }

        if (this.firstPosition) {
          this.map.flyTo({
            center: location,
            zoom: 18,
            pitch: 0,
            bearing: 0,
            duration: 1500,
          });

          this.firstPosition = false;
        }

        this.tracking = true;
        this.button.disabled = false;
        this.button.title = `GPS active · ±${Math.round(accuracy)} m`;
      },

      (error) => {
        console.error("GPS error:", error.code, error.message);

        this.button.disabled = false;
        this.tracking = false;
        this.button.title = "Show my location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission was denied.\n\n" +
                "Please allow Location access for this website in your browser settings.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            alert(
              "Your GPS location is currently unavailable. " +
                "Make sure Location/GPS is turned on.",
            );
            break;

          case error.TIMEOUT:
            alert(
              "GPS took too long to respond. " +
                "Try moving outside or near a window.",
            );
            break;

          default:
            alert("Unable to determine your location.");
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      },
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.tracking = false;
    this.firstPosition = true;

    this.button.title = "Show my location";

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  onRemove() {
    this.stopTracking();

    this.container.remove();
    this.map = undefined;
  }
}

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

map.addControl(new GPSControl(), "top-right");
map.addControl(new HomeControl(), "top-right");
map.addControl(new ThreeDControl(), "top-right");
