const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night'
/**
 * This function is meant to create the map, set the centre and zoom, add a new map style and add markers.
 * Map styles are different modes that will be displayed to the user
 * Added night mode (static configs for that style in extraMapStyles.json)
 * New modes/map styles can be added in extraMapStyles.json file.
 *
 */

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
  const map = new google.maps.Map(document.getElementById(MAP_ELEMENT_ID), {
    center: {lat: 1.290270, lng: 103.851959},
    zoom: 13,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', MAP_NIGHT_TYPE_ID]
    }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set(MAP_NIGHT_TYPE_ID, styledMapType);
  map.setMapTypeId(MAP_NIGHT_TYPE_ID);

  createCinemaMarkers(map);
}

/**
 * This function fetches cinima markers from the backend and places them on the map.
 */
function createCinemaMarkers(map){
  fetch('/cinema-data')
    .then(response => response.json())
    .then(cinemaMarkers => {
      cinemaMarkers.forEach((cinemaMarker) => {
        createCinemaMarkerForDisplay(map, cinemaMarker.lat, cinemaMarker.lng, cinemaMarker.content, cinemaMarker.key)
      });
    });
}

/** Creates a marker that shows an info window with existing reviews and editable comment session
 *for user when clicked.
 */
function createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key, updateMode=false){
  const cinemaMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map
  });
  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(map, lat, lng, cinemaName, key, cinemaMarker)
  });
  if (updateMode) {
    infoWindow.open(map, cinemaMarker);
  }
  cinemaMarker.addListener('click', () => {
    infoWindow.open(map, cinemaMarker);
  });
}

/** Sends a message to the backend for saving. */
function postMessage(parentKey, text){
  const params = new URLSearchParams();
  params.append('parentKey', parentKey);
  params.append('text', text);
  fetch('/messages', {
    method: 'POST',
    body: params
  });
}


/** Builds and returns HTML elements that show an editable textbox and a submit button. */
function buildInfoWindowInput(map, lat, lng, cinemaName, key, marker){
  // TODO: add user reviews grepping
  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Submit'));
  button.onclick = () => {
    postMessage(key, textBox.value);
    marker.setMap(null);
    createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key, updateMode=true);
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
