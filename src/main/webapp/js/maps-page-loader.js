const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night'
/**
 * This function is meant to create the map, set the centre and zoom, add a new map style and add markers.
 * Map styles are different modes that will be displayed to the user
 * Added night mode (static configs for that style in extraMapStyles.json)
 * New modes/map styles can be added in extraMapStyles.json file.
 *
 */

let map;
/* Editable marker that displays when a user clicks in the map. */
let editMarker;

function fetchConfigAndBuildMap() {
  const url = '/json/extraMapStyles.json';
  fetch(url)
    .then(response => response.json())
    .then(data => addDiffStylesToMap(data.Night));
}

function addDiffStylesToMap(mapStyle){
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  mapStyleName = 'Night';
  const styledMapType = new google.maps.StyledMapType(mapStyle, {name: mapStyleName});

  createStyledMap(styledMapType);
}

function createStyledMap(styledMapType){
  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  map = new google.maps.Map(document.getElementById(MAP_ELEMENT_ID), {
    center: {lat: 1.290270, lng: 103.851959},
    zoom: 13,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', MAP_NIGHT_TYPE_ID]
    }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set(MAP_NIGHT_TYPE_ID, styledMapType);
  map.setMapTypeId(MAP_NIGHT_TYPE_ID);

  createCinemaLocationsMap(map);

  // When the user clicks in the map, show a marker with a text box the user can edit.
  map.addListener('click', (event) => {
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  });
  fetchMarkers();
}

/**
 * This function places markers of the cinema locations on the map.
 */
function createCinemaLocationsMap(map){
  fetch('/cinema-data')
    .then(response => response.json())
    .then(cinemaLocations => cinemaLocations.forEach((cinemaLocation) => {
    new google.maps.Marker({
      position: {lat: cinemaLocation.lat, lng: cinemaLocation.lng},
      map: map
    });
  }));
}

/** Fetches markers from the backend and adds them to the map. */
function fetchMarkers(){
  fetch('/markers').then((response) => {
    return response.json();
  }).then((markers) => {
    markers.forEach((marker) => {
     createMarkerForDisplay(marker.lat, marker.lng, marker.content)
    });
  });
}

/** Creates a marker that shows a read-only info window when clicked. */
function createMarkerForDisplay(lat, lng, content){
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map
  });
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
}

/** Sends a marker to the backend for saving. */
function postMarker(lat, lng, content){
  const params = new URLSearchParams();
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('content', content);
  fetch('/markers', {
    method: 'POST',
    body: params
  });
}

/** Creates a marker that shows a textbox the user can edit. */
function createMarkerForEdit(lat, lng) {
  // If an editable marker is already shown, remove it.
  if (editMarker) {
   editMarker.setMap(null);
  }
  editMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map
  });
  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(lat, lng)
  });
  // Removes the marker when the user closes the editable info window.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editMarker.setMap(null);
    editMarker = null;
  });
  infoWindow.open(map, editMarker);
}

/** Builds and returns HTML elements that show an editable textbox and a submit button. */
function buildInfoWindowInput(lat, lng) {
  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Submit'));
  button.onclick = () => {
    postMarker(lat, lng, textBox.value);
    createMarkerForDisplay(lat, lng, textBox.value);
    editMarker.setMap(null);
    editMarker = null;
  };
  const containerDiv = document.createElement('div');
  containerDiv.appendChild(textBox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);
  return containerDiv;
}

function buildUI() {
  fetchConfigAndBuildMap();
}
