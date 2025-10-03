// magnification with which the map will start
const zoom = 13;
// co-ordinates
const lat = 52.5051;
const lng = 13.3855;


// === Tile Layers ===
var OpenStreetMap_HOT = L.tileLayer(
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                 'Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> ' +
                 'hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
  }
);

var landMap = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
  { attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors & <a href="http://cartodb.com/attributions">CartoDB</a>' }
);

// === Map Configuration ===
let config = {
  minZoom: 7,
  maxZoom: 18,
  layers: [OpenStreetMap_HOT], // Default initial layer
};

// === Base Layers Object for Layer Control ===
var baseLayers = {
  // "OSM HOT": OpenStreetMap_HOT,
  // "OSM Mapnik": osmMap,
  // "CartoDB": landMap,
  // "Berlin": degreyMap,
  "Light": OpenStreetMap_HOT,
  "Dark": landMap,
};

// === SVG Marker Template ===
const htmlTemplate = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" />
</svg>`;


//calling map
const map = L.map("map", config).setView([lat, lng], zoom);
var layerControl = L.control.layers(baseLayers).addTo(map);

//-----------------------------------------------------------

function add_layer(file,name){
  function get_color(feature, name) {
    const defaults = {
      "U-Bahn": "#FF00FF",   
      "S-Bahn": "#018A47",   
      "Tram": "#BE1414",     
      "Bus": "#95276E",      
      "Fähre": "#0080BA"     
    };
    // Use feature color if available, otherwise default for this layer
    return feature.properties.colour || defaults[name] || "#FF00FF"; // fallback magenta
  }


  fetch(file)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // use geoJSON
      const ubahnLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: get_color(feature, name), // fallback red
            weight: 2,
            fillOpacity: 1
          };
        },
        pointToLayer: function (feature, latlng) {
          const ubahnIcon = L.icon({
            iconUrl: name+".svg",   // Pfad zu deiner SVG-Datei
            iconSize: [10, 10],      // gewünschte Breite, Höhe in Pixel
            iconAnchor: [0, 0],    // Ankerpunkt (Mitte unten)
            popupAnchor: [0, -10]    // Position des Popups relativ zum Icon
          });

          return; //L.marker(latlng, { icon: ubahnIcon });
        },
        onEachFeature: function onEachFeature(feature, layer) {
              layer.bindPopup(feature.properties.name);
        },
      });
      const iconLabel = `<img src="${name}.svg" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> ${name}`;
      layerControl.addOverlay(ubahnLayer, iconLabel);
      ubahnLayer.addTo(map);
  });
}

add_layer("ubahn.geojson","U-Bahn");
add_layer("sbahn.geojson","S-Bahn");
add_layer("tram.geojson","Tram");
add_layer("bus.geojson","Bus");
add_layer("ferry.geojson","Fähre");

//-------------------------------------------------------------------

// create custom button
const customControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
  },

  // method
  onAdd: function (map) {
    console.log(map.getCenter());
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "back to home";
    btn.innerHTML = htmlTemplate;
    btn.className += "leaflet-bar back-to-home hidden";

    return btn;
  },
});

// adding new button to map controll
map.addControl(new customControl());

// on drag end
map.on("moveend", getCenterOfMap);

const buttonBackToHome = document.querySelector(".back-to-home");

function getCenterOfMap() {
  buttonBackToHome.classList.remove("hidden");

  buttonBackToHome.addEventListener("click", () => {
    map.flyTo([lat, lng], zoom);
  });

  map.on("moveend", () => {
    const { lat: latCenter, lng: lngCenter } = map.getCenter();

    const latC = latCenter.toFixed(3) * 1;
    const lngC = lngCenter.toFixed(3) * 1;

    const defaultCoordinate = [+lat.toFixed(3), +lng.toFixed(3)];

    const centerCoordinate = [latC, lngC];

    if (compareToArrays(centerCoordinate, defaultCoordinate)) {
      buttonBackToHome.classList.add("hidden");
    }
  });
}

const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ------------------------------------------------------------
// async function to get data from json
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

