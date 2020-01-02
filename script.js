// Edit the initial year and number of tabs to match your GeoJSON data and tabs in index.html
var year = "2020";
var tabs = 10;
var state = "Statewide";

// Edit the center point and zoom level
var map = L.map('map', {
  center: [39.271,-105.568],
  zoom: 6,
  scrollWheelZoom: false
});

// Edit links to your GitHub repo and data source credit
map.attributionControl
.setPrefix('View <a href="https://github.com/ericjlubbers/colorado-population-by-year">data and code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>; design by <a href="http://coloradosun.com">Eric Lubbers, The Colorado Sun</a>');

// Basemap layer
new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

// Edit to upload GeoJSON data file from your local directory
$.getJSON("https://ericjlubbers.github.io/colorado-population-by-year/colorado-counties.geojson", function (data) {
  geoJsonLayer = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});




// Edit range cutoffs and colors to match your data; see http://colorbrewer.org
// Any values not listed in the ranges below displays as the last color
// function getColor(d) {
//   return d > 10 ? '#08519c' :
//   d > 8 ? '#3182bd' :
//     d > 6 ? '#6baed6' :
//     d > 4 ? '#9ecae1' :
//     d > 0 ? '#c6dbef' :
//     d > -2 ? '#fddbc7' :
//     d > -4 ? '#d6604d' :
//   d > -6 ? '#b2182b' :
//                    '#b2182b'
// }

// Edit the getColor property to match data properties in your GeoJSON file
// In this example, columns follow this pattern: index1910, index1920...
function style(feature) {
  return {
    fillColor: getColor(feature.properties["change" + year]),
    weight: 1,
    opacity: 1,
    color: 'black',
    fillOpacity: 0.9
  };
}

// This highlights the polygon on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    color: 'black',
    fillOpacity: 0.7
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature
  });
}

// Creates an info box on the map
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};


// When a new tab is selected, this changes the year displayed
$(".tabItem").click(function() {
  $(".tabItem").removeClass("selected");
  $(this).addClass("selected");
  year = $(this).html();
  // year = $(this).html().split("-")[1];  /* use for school years, eg 2010-11 */
  geoJsonLayer.setStyle(style);
});


// Edit info box labels (such as props.town) to match properties of the GeoJSON data
info.update = function (props) {
  var winName =
  this._div.innerHTML = (props ?
    '<div class="areaName">' + props.name + ' County</div>' : '<div class="areaName faded"><small>Hover over county for data</small></div>') + '<div class="areaLabel"><div class="areaValue">Est. ' + year + ' Pop.</div>' +(props ? '' + (checkNull(props[year])) : "--") + '</div>'  + '<div class="areaLabel"><div class="areaValue">5-year change</div>' +(props ? '' + (checkNull(props["change" + year])) : '--') + '%</div>' + '<div class="areaLabel"><div class="areaValue">Total ± since 2000</div>' +(props ? '' + (checkNull(props["y2k" + year])) : '--') + '</div>';
};
info.addTo(map);

var stops = [
    { stop: 10, color: '#08519c' },
    { stop: 8, color: '#3182bd' },
    { stop: 6, color: '#6baed6' },
    { stop: 4, color: '#9ecae1' },
    { stop: 0, color: '#c6dbef' },
    { stop: -2, color: '#fddbc7' },
    { stop: -4, color: '#d6604d' },
    { stop: -6, color: '#b2182b' },
    { stop: -15, color: '#8f0e1e' },
];



function getColor(d) {
  for (var i in stops) {
    if (d > stops[i].stop) { return stops[i].color; }
  }
};

// Edit grades in legend to match the range cutoffs inserted above
// In this example, the last grade will appear as "2+"
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10,-4,-2,0.1,4,6,8,10,11],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' to ' + grades[i + 1] + '%<br>' : '% +');
    }

    return div;
};

legend.addTo(map);


// In info.update, this checks if GeoJSON data contains a null value, and if so displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}



// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

// This watches for arrow keys to advance the tabs
$("body").keydown(function(e) {
    var selectedTab = parseInt($(".selected").attr('id').replace('tab', ''));
    var nextTab;

    // previous tab with left arrow
    if (e.keyCode == 37) {
        nextTab = (selectedTab == 1) ? tabs : selectedTab - 1;
    }
    // next tab with right arrow
    else if (e.keyCode == 39)  {
        nextTab = (selectedTab == tabs) ? 1 : selectedTab + 1;
    }

    $('#tab' + nextTab).click();
});
