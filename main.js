window.onload = init;

function init(){
  // HTML element
  const mapElement = document.getElementById('mapid')

  // Basemaps
  const openStreetMapStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Leaflet map object
  const mymap = L.map(mapElement, {
    center: [ 41.156839365863156, 65.44381329528844],
    zoom: 6,
    minZoom: 5,
    worldCopyJump: true,
    layers: [openStreetMapStandard] 
  })
  

  // Basemap Object
  const baseLayers = {
    '<b>OpenStreetMap Standard</b>': openStreetMapStandard,
    'Esri WorldImagery': Esri_WorldImagery
  }
  
   // Layer control
   const layerControl = L.control.layers(baseLayers, '', {
    collapsed: false,
    position: 'topright'
  }).addTo(mymap)


  // Cities Styles
  var GeneralStyle_capital_cities_of_regions = {
    "color": "blue",
    "fillOpacity": 0.5,
    "weight": 2,
    "opacity": 1
  };

  var TashkentStyle_capital_cities_of_regions = {
    "color": "blue",
    "fillColor": "blue",
    "fillOpacity": 0.4,
    "weight": 2,
    "opacity": 1
  };

  // Main roads styles
  var mainRoadsStyles = {
    color:'black',
    weight: 2,
    opacity: 0.4
  }

  var boundaryUzbStyle = {
    color: '#3388ff',
    fillOpacity: 0
  }

  // Perform adding popup to each feature and styling
  function onEachPointFeature(feature, layer){
    if (feature.properties && feature.properties.name){
      layer.bindPopup(`${feature.properties.name} city, population is ${feature.properties.population}`)
      //layer.bindTooltip(`Your are hovering over ${feature.properties.name} city`)
      
      // Style for all cities except Tashkent
      layer.setRadius(feature.properties.population / 18) 
      layer.setStyle(GeneralStyle_capital_cities_of_regions)

      // Style for Tashkent
      if (feature.properties.name === 'Toshkent'){
        layer.setRadius(feature.properties.population / 80)       
        layer.setStyle(TashkentStyle_capital_cities_of_regions)      
      }
    }
  }

  function onEachLineFeature(feature, layer){
    if (feature.properties && feature.properties.type){
      layer.bindPopup(`Road type: ${feature.properties.type}`)
    }
    layer.setStyle(mainRoadsStyles)
  }

  function onEachPointStandard(feature, layer){
    if (feature.properties && feature.properties.type){
      layer.bindTooltip(`Your are hovering over the attraction: <b>${feature.properties.name}</b>`)
      layer.bindPopup(`Attraction: <b>${feature.properties.name}</b>`)
    }
  }

  function onEachPolygonFeature(feature, layer){
    if (feature.properties){
      layer.setStyle(boundaryUzbStyle)
    }
  }


  // Adding geoJSON to the map
  function addGeoJSON(geoJSON, dataType, geoJSONLayerName) {    
    let geoJsonLayer;
    
    // Point tourist attractions
    if(dataType === 'Point_touristAttractions'){
      geoJsonLayer = L.geoJSON(geoJSON, {
        onEachFeature: onEachPointStandard,
      })    
      geoJsonLayer.addTo(mymap)
    }

    // Capital cities
    if(dataType === 'capitalCities'){
      geoJsonLayer = L.geoJSON(geoJSON, {
        onEachFeature: onEachPointFeature,
        pointToLayer: function (geoJsonFeature, latlng) {
          return L.circle(latlng)
        }
      })      
      geoJsonLayer.addTo(mymap)
    }

    // If data type is Main roads
    if (dataType === 'Line'){
      
      geoJsonLayer = L.geoJSON(geoJSON, {
        onEachFeature: onEachLineFeature,
      })
      geoJsonLayer.bringToBack()      
    }    
    
    if (dataType === 'Line_Uzb_Boundary'){
      geoJsonLayer = L.geoJSON(geoJSON, {
        onEachFeature: onEachPolygonFeature,
      })
      geoJsonLayer.addTo(mymap)
      geoJsonLayer.bringToBack()
    }    
    layerControl.addOverlay(geoJsonLayer, geoJSONLayerName)
  }

  // Fetching the geoJSON capital cities data
  function fetchData(url, dataType, geoJSONLayerName) {
    fetch(url, {
      method: 'GET',
      mode: 'no-cors'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (geoJSON) {        
        addGeoJSON(geoJSON, dataType, geoJSONLayerName)
      })
      .catch(function(error){
        console.log(error)
      })
  } 

   // Tourist attractions and calling the function to fetch
   var touristAttractionsURL = './Data/historic_places.geojson';
   var touristAttractionsgeoJSONLayerName = 'Tourist attractions'
   var touristAttractionsDataType = 'Point_touristAttractions';
   fetchData(touristAttractionsURL, touristAttractionsDataType, touristAttractionsgeoJSONLayerName)

  // Capital Cities URL and calling the function to fetch
  var captialCitiesURL = './Data/capital_cities_of_regions.geojson';
  var captialCitiesLayerName = 'Capital cities of regions'
  var captialCitiesDataType = 'capitalCities';
  fetchData(captialCitiesURL, captialCitiesDataType, captialCitiesLayerName)


  // Boundary Uzbekistan
  var boundaryUzbURL = './Data/uzbekistan_boundary_v2.geojson';
  var boundaryUzbLayerName = 'Boundary of Uzbekistan'
  var boundaryUzbDataType = 'Line_Uzb_Boundary';
  fetchData(boundaryUzbURL, boundaryUzbDataType, boundaryUzbLayerName)

  // Main roads URL and calling the function to fetch
  var mainRoadsURL = './Data/main_roads.geojson';
  var mainRoadsgeoJSONLayerName = 'Main roads'
  var mainRoadsDataType = 'Line';
  fetchData(mainRoadsURL, mainRoadsDataType, mainRoadsgeoJSONLayerName)


  
 
 
}