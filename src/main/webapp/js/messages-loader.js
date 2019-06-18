
// Fetch messages and add them to the page.
function fetchMessages(){
  const url = '/feed';
  fetch(url).then((response) => response.json()
  ).then((messages) => {
    const messageContainer = document.getElementById('message-container');
    if (messages.length == 0){
      messageContainer.innerHTML = '<p>There are no posts yet.</p>';
    } else {
      messageContainer.innerHTML = '';
    }
    messages.forEach((message) => {
      messageContainer.appendChild(buildMessageDiv(message));
    });
  });
}

function buildMessageDiv(message){
  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add("left-align");
  usernameDiv.appendChild(document.createTextNode(message.user));

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('center-align');
  timeDiv.appendChild(document.createTextNode(new Date(message.timestamp)));

  const sentimentScoreDiv = document.createElement('div');
  sentimentScoreDiv.classList.add('right-align');
  sentimentScoreDiv.appendChild(document.createTextNode(message.sentimentScore));

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');
  headerDiv.appendChild(usernameDiv);
  headerDiv.appendChild(timeDiv);
  headerDiv.appendChild(sentimentScoreDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  bodyDiv.appendChild(document.createTextNode(message.text));m
  const messageDiv = document.createElement('div');
  messageDiv.classList.add("message-div");
  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(bodyDiv);

  return messageDiv;
}

// Posts the selected language to be translated to and fetch translated messages from server.
function submitTransReq() {
  const url = '/feed';
  const language = document.getElementById('language').value;
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerText = 'Loading...';

  const params = new URLSearchParams();
  params.append('language', language);

  var transReq = new XMLHttpRequest();
  transReq.responseType = 'json';
  transReq.open('POST', url);
  transReq.send(params);

  transReq.onload = function () {
    if (transReq.status == 200) {
      let messages = transReq.response;
      if (messages.length == 0) {
        messageContainer.innerHTML = '<p>There are no posts yet.</p>';
      } else {
        messageContainer.innerHTML = '';
      }
      messages.forEach((message) => {
        messageContainer.appendChild(buildMessageDiv(message));
      });
    } else {
      messageContainer.innerText = 'Translation failed. Please refresh the page.';
      console.log(transReq.status);
    }
  }
}

// Fetch data and populate the UI of the page.
function buildUI(){
  fetchMessages();
}
