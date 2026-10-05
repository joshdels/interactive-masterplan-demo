const locationIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 2V4M12 20V22M2 12H4M20 12H22"></path></svg>`;
const homeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11L12 3L21 11"></path><path d="M5 10V21H19V10"></path><path d="M9 21V14H15V21"></path></svg>`;
const basemapIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5Z"></path><path d="m3 12 9 5 9-5M3 16l9 5 9-5"></path></svg>`;

function createButton(label, content) {
  const button = document.createElement("button");
  button.type = "button";
  setLabel(button, label);
  button.innerHTML = content;
  return button;
}

function setLabel(button, label) {
  button.title = label;
  button.setAttribute("aria-label", label);
}

function createContainer() {
  const container = document.createElement("div");
  container.className = "maplibregl-ctrl maplibregl-ctrl-group";
  return container;
}

export class GPSControl {
  constructor(maplibregl) {
    this.maplibregl = maplibregl;
  }

  onAdd(map) {
    this.map = map;
    this.watchId = null;
    this.marker = null;
    this.tracking = false;
    this.firstPosition = true;
    this.container = createContainer();
    this.button = createButton("Show my location", locationIcon);
    this.button.addEventListener("click", () =>
      this.tracking ? this.stopTracking() : this.startTracking(),
    );
    this.container.appendChild(this.button);
    return this.container;
  }

  startTracking() {
    if (!navigator.geolocation) {
      window.alert("GPS location is not supported by this browser.");
      return;
    }
    setLabel(this.button, "Locating…");
    this.button.disabled = true;
    this.watchId = navigator.geolocation.watchPosition(
      ({ coords }) => this.updatePosition(coords),
      (error) => this.handleError(error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
    );
  }

  updatePosition({ latitude, longitude, accuracy }) {
    const location = [longitude, latitude];
    if (!this.marker) {
      const element = document.createElement("div");
      element.className = "location-marker";
      this.marker = new this.maplibregl.Marker({ element })
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
    this.button.classList.add("is-active");
    setLabel(this.button, `GPS active · ±${Math.round(accuracy)} m`);
  }

  handleError(error) {
    this.stopTracking();
    const messages = {
      [error.PERMISSION_DENIED]:
        "Location permission was denied. Allow location access in your browser settings.",
      [error.POSITION_UNAVAILABLE]:
        "Your location is unavailable. Make sure Location/GPS is turned on.",
      [error.TIMEOUT]:
        "GPS took too long to respond. Try moving outside or near a window.",
    };
    window.alert(messages[error.code] || "Unable to determine your location.");
  }

  stopTracking() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.tracking = false;
    this.firstPosition = true;
    this.button.disabled = false;
    this.button.classList.remove("is-active");
    setLabel(this.button, "Show my location");
    this.marker?.remove();
    this.marker = null;
  }

  onRemove() {
    this.stopTracking();
    this.container.remove();
    this.map = undefined;
  }
}

export class HomeControl {
  constructor(homeView) {
    this.homeView = homeView;
  }

  onAdd(map) {
    this.map = map;
    this.container = createContainer();
    this.button = createButton("Return to project", homeIcon);
    this.button.addEventListener("click", () =>
      map.easeTo({ ...this.homeView, duration: 1000 }),
    );
    this.container.appendChild(this.button);
    return this.container;
  }

  onRemove() {
    this.container.remove();
    this.map = undefined;
  }
}

export class ThreeDControl {
  constructor({ terrainSource = "terrain", exaggeration = 1.5 } = {}) {
    this.terrainSource = terrainSource;
    this.exaggeration = exaggeration;
  }

  onAdd(map) {
    this.map = map;
    this.is3D = false;
    this.container = createContainer();
    this.button = createButton("Enable 3D terrain", "3D");
    this.button.classList.add("text-control");
    this.button.addEventListener("click", () => this.toggle());
    this.container.appendChild(this.button);
    return this.container;
  }

  toggle() {
    this.is3D = !this.is3D;
    this.map.setTerrain(
      this.is3D
        ? { source: this.terrainSource, exaggeration: this.exaggeration }
        : null,
    );
    this.map.easeTo(
      this.is3D
        ? { pitch: 65, bearing: -20, duration: 1000 }
        : { pitch: 0, bearing: 0, duration: 1000 },
    );
    this.button.textContent = this.is3D ? "2D" : "3D";
    this.button.classList.toggle("is-active", this.is3D);
    setLabel(this.button, this.is3D ? "Switch to 2D" : "Enable 3D terrain");
  }

  onRemove() {
    this.container.remove();
    this.map = undefined;
  }
}

export class BasemapControl {
  constructor({ basemaps, defaultBasemap }) {
    this.basemaps = basemaps;
    this.activeBasemap = defaultBasemap;
    this.handleDocumentClick = (event) => {
      if (!this.container.contains(event.target)) this.close();
    };
    this.handleEscape = (event) => {
      if (event.key === "Escape") {
        this.close();
        this.button.focus();
      }
    };
  }

  onAdd(map) {
    this.map = map;
    this.handleMapLoad = () => {
      this.button.disabled = false;
    };
    this.container = createContainer();
    this.container.classList.add("basemap-control");
    this.button = createButton("Choose basemap", basemapIcon);
    this.button.setAttribute("aria-expanded", "false");
    this.button.setAttribute("aria-haspopup", "true");
    this.button.disabled = !map.loaded();
    this.button.addEventListener("click", () => this.toggle());
    if (this.button.disabled) map.once("load", this.handleMapLoad);

    this.gallery = document.createElement("div");
    this.gallery.className = "basemap-gallery";
    this.gallery.setAttribute("role", "menu");
    this.gallery.setAttribute("aria-label", "Basemaps");
    this.gallery.hidden = true;

    for (const basemap of this.basemaps) {
      this.gallery.appendChild(this.createOption(basemap));
    }

    this.container.append(this.button, this.gallery);
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleEscape);
    return this.container;
  }

  createOption(basemap) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "basemap-option";
    option.dataset.basemapId = basemap.id;
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", String(basemap.id === this.activeBasemap));

    const thumbnail = document.createElement("span");
    thumbnail.classList.add("basemap-thumbnail");
    if (basemap.thumbnailClass) thumbnail.classList.add(basemap.thumbnailClass);
    thumbnail.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "basemap-label";
    label.textContent = basemap.label || basemap.id;
    option.title = label.textContent;
    option.append(thumbnail, label);

    option.addEventListener("click", () => this.select(basemap.id));
    return option;
  }

  select(id) {
    this.activeBasemap = id;
    for (const basemap of this.basemaps) {
      if (basemap.source) {
        this.map.setLayoutProperty(
          `basemap-${basemap.id}`,
          "visibility",
          basemap.id === id ? "visible" : "none",
        );
      }
    }
    for (const option of this.gallery.querySelectorAll(".basemap-option")) {
      option.setAttribute("aria-checked", String(option.dataset.basemapId === id));
    }
    this.close();
    this.button.focus();
  }

  toggle() {
    const willOpen = this.gallery.hidden;
    this.gallery.hidden = !willOpen;
    this.button.classList.toggle("is-active", willOpen);
    this.button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      this.gallery.querySelector('[aria-checked="true"]')?.focus();
    }
  }

  close() {
    this.gallery.hidden = true;
    this.button.classList.remove("is-active");
    this.button.setAttribute("aria-expanded", "false");
  }

  onRemove() {
    this.map.off("load", this.handleMapLoad);
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleEscape);
    this.container.remove();
    this.map = undefined;
  }
}
