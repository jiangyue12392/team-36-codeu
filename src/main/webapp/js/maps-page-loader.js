const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night'
/**
 * This function is meant to create the map, set the centre and zoom, add a new map style and add markers.
 * Map styles are different modes that will be displayed to the user (The user can switch around with button)
 * Added night mode (the static configs for that style is in extraMapStyles.json)
 * New modes/map styles can be added in extraMapStyles.json file.
 *
 */
function fetchNightStyleJSONValues() {
  const url = '/json/extraMapStyles.json';
  fetch(url)
    .then(response => response.json())
    .then(data => addDiffStylesToMap(data.Night));
}

function addDiffStylesToMap(nightStyle){
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  const styledMapType = new google.maps.StyledMapType(nightStyle,{name: 'Night'});

  createNightStyledMap(styledMapType);
}

function createNightStyledMap(styledMapType){
  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  const map = new google.maps.Map(document.getElementById(MAP_ELEMENT_ID), {
    center: {lat: 1.2764558, lng: 103.7996469},
    zoom: 16,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', MAP_NIGHT_TYPE_ID]
    }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set(MAP_NIGHT_TYPE_ID, styledMapType);
  map.setMapTypeId(MAP_NIGHT_TYPE_ID);

  // Place a marker on the map at the specified position
  const trexMarker = new google.maps.Marker({
    position: {lat: 1.2765, lng: 103.8},
    map: map,
    title: 'Stan the T-Rex'
  });

  // Have a pop-up window over the marker
  const trexInfoWindow = new google.maps.InfoWindow({
    content: 'This is not Stan, the T-Rex statue.'
  });
  trexInfoWindow.open(map, trexMarker);


}

function buildUI(){
  fetchNightStyleJSONValues();
}