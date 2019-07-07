const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night';

let chairIcon = {
  url: '/images/seat.png',
  //state your size parameters in terms of pixels
  size: new google.maps.Size(40, 30),
  scaledSize: new google.maps.Size(40, 30),
  origin: new google.maps.Point(0,0)
};

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
    center: {lat: 1.360860, lng: 103.823800},
    zoom: 12,
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
 * This function fetches cinema markers from the backend and places them on the map.
 */
async function createCinemaMarkers(map) {
  const fetchResult = fetch('/cinema-data');
  const response = await fetchResult;
  const jsonData = await response.json();
  jsonData.forEach((cinemaMarker) => {
    createCinemaMarkerForDisplay(map, cinemaMarker.lat, cinemaMarker.lng, cinemaMarker.content, cinemaMarker.key)
  });
}

/** Creates a marker that shows an info window with existing reviews and editable comment session
 *for user when clicked.
 */
/** Creates a marker that shows an info window with existing reviews and editable comment session
 *for user when clicked.
 */
async function createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key, updateMode=false) {
  const cinemaMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map,
    /*// set the icon as catIcon declared above
    icon: chairIcon,
    // must use optimized false for CSS
    optimized: false,
    animation: google.maps.Animation.DROP*/
  });

  const infoText = document.createTextNode(cinemaName);

  const containerDiv = document.createElement('div');
  containerDiv.appendChild(infoText);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(document.createElement('br'));

  await getMessagesForKey(key, containerDiv);

  const infoWindow = new google.maps.InfoWindow({
    content: buildInfoWindowInput(map, lat, lng, cinemaName, key, cinemaMarker, containerDiv)
  });
  if (updateMode) {
    infoWindow.open(map, cinemaMarker);
  }
  cinemaMarker.addListener('click', () => {
    infoWindow.open(map, cinemaMarker);
    //Use this to click marker to show popup
    /*document.getElementById('abc').style.display = "block";*/
  });
}

/**
 * This function fetches messages for the given parent key.
 */
async function getMessagesForKey(key, containerDiv) {
  await fetch('/messagebykey?parentKey=' + key)
    .then(response => response.json())
    .then(messagesForKey => {
      messagesForKey.forEach((message) => {
        containerDiv.appendChild(document.createTextNode(message.text));
        containerDiv.appendChild(document.createElement('br'));
      });
    });
}

/** Sends a message to the backend for saving. */
function postMessage(parentKey, text) {
  const params = new URLSearchParams();
  params.append('parentKey', parentKey);
  params.append('text', text);
  fetch('/marker-messages', {
    method: 'POST',
    body: params
  });
}

async function handleSubmitButtonClick(map, lat, lng, cinemaName, key, marker, text) {
  const delay = ms => new Promise(res => setTimeout(res, ms));
  await postMessage(key, text);
  marker.setMap(null);
  //set delay to ensure message is persisted in data store and can be retrieved to be shown in the info window
  await delay(4500);
  createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key, updateMode=true);
}

/** Builds and returns HTML elements that show an editable textbox and a submit button. */
function buildInfoWindowInput(map, lat, lng, cinemaName, key, marker, containerDiv) {
  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('Submit'));
  button.onclick = () => {
    handleSubmitButtonClick(map, lat, lng, cinemaName, key, marker, textBox.value);
  };
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(textBox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);
  return containerDiv;
}

function buildUI() {
  fetchConfigAndBuildMap();
}
