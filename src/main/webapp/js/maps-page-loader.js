const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night';

let chairIcon = {
  url: '/images/seat.png',
  size: new google.maps.Size(40, 30), //state your size parameters in terms of pixels
  scaledSize: new google.maps.Size(40, 30),
  origin: new google.maps.Point(0, 0)
};

let loginStatus = false;
let aggregateSentiment;

/**
* This function is meant to create the map, set the centre and zoom, add a new map style and add markers.
* Map styles are different modes that will be displayed to the user
* Added night mode (static configs for that style in extraMapStyles.json)
* New modes/map styles can be added in extraMapStyles.json file.
*/
function fetchConfigAndBuildMap() {
  const url = '/json/extraMapStyles.json';
  fetch(url)
      .then(response => response.json())
      .then(data => addDiffStylesToMap(data.Night));
}

function addDiffStylesToMap(mapStyle) {
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  mapStyleName = 'Night';
  const styledMapType = new google.maps.StyledMapType(mapStyle, { name: mapStyleName });

  createStyledMap(styledMapType);
}

function createStyledMap(styledMapType) {
  // Create a map object, and include the MapTypeId to add to the map type control.
  const map = new google.maps.Map(document.getElementById(MAP_ELEMENT_ID), {
    center: { lat: 1.360860, lng: 103.823800 },
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
function createCinemaMarkers(map) {
  fetch('/cinema-data')
      .then(response => response.json())
      .then(jsonData => {
        jsonData.forEach((cinemaMarker) => {
          createCinemaMarkerForDisplay(map, cinemaMarker.lat, cinemaMarker.lng, cinemaMarker.content, cinemaMarker.key)
        });
      });
}

/**
* Creates a marker that shows an info window with the cinema name and handles user interaction events
*/
function createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key) {
  const cinemaMarker = new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: map,
    // set the icon as catIcon declared above
    icon: chairIcon,
    // must use optimized false for CSS
    optimized: false
  });

  const infoText = document.createTextNode(cinemaName);
  const infoWindow = new google.maps.InfoWindow({
    content: infoText
  });

  cinemaMarker.addListener('click', () => {
    buildPopupWindowInput(cinemaName, key);
  });

  cinemaMarker.addListener('mouseover', () => {
    infoWindow.open(map, cinemaMarker);
  });

  cinemaMarker.addListener('mouseout', () => {
    infoWindow.close();
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
  }).then(response => response.json())
  .then(jsonData => {
    // html5 session storage, may not work on some old browser
    localStorage.setItem("postMessage", JSON.stringify(jsonData));
    window.location.href = "/feed.html?cinemaKey=" + parentKey;
  });
}

/** Builds HTML pop up that show an editable textbox and a submit button. Then handles submit */
function buildPopupWindowInput(cinemaName, key) {
  document.getElementById("cinemaName").innerHTML = cinemaName;
  document.getElementById('mapsPgPopUp').style.display = "block";
  const textBox = document.getElementById('submitReviewTextArea');

  let sentimentScore = '--';
  if (aggregateSentiment.hasOwnProperty(key)) {
    sentimentScore = aggregateSentiment[key].toFixed(2);
  }
  document.getElementById('cinemaSentimentScore').innerHTML = sentimentScore + "/ 1.0";

  const button = document.getElementById('submitReviewsButton');
  if (!loginStatus) {
    button.innerHTML = "Login to review"
  }
  button.onclick = () => {
    if (loginStatus) {
      postMessage(key, textBox.value);
    } else {
      window.location.href = "/login";
    }
    button.disabled = true;
  };
}

function div_hide() {
  document.getElementById('mapsPgPopUp').style.display = "none";
}

function fetchLoginStatus() {
  fetch('/login-status')
      .then((response) => response.json())
      .then((loginStatusResponse) => {
        loginStatus = loginStatusResponse.isLoggedIn;
      });
}

function fetchSentimentScore() {
  fetch('/sentiment-aggregate')
      .then((response) => response.json())
      .then((sentimentJson) => { aggregateSentiment = sentimentJson;} );
}

function buildUI() {
  fetchLoginStatus();
  fetchSentimentScore();
  fetchConfigAndBuildMap();
}
