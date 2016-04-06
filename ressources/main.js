let sendChannel = {};
let receiveChannel = {};

let dataChannelSend = {};
let dataChannelReceive = {};

let startButton = {};
let sendButton = {};
let closeButton = {};

const init = () => {
  startButton = document.getElementById('startButton');
  sendButton = document.getElementById('sendButton');
  closeButton = document.getElementById('closeButton');

  dataChannelSend = document.getElementById('dataChannelSend');
  dataChannelReceive = document.getElementById('dataChannelReceive');
};

/*
const trace = (text) => {
  console.log(`${(performance.now() / 1000).toFixed(3)}: ${text}`);
};
*/

const createConnection = () => {
  const servers = null;

  const gotLocalCandidate = (event) => {
    trace('local ice callback');
    if (event.candidate) {
      window.remotePeerConnection.addIceCandidate(event.candidate);
      trace(`Local ICE candidate: \n ${event.candidate.candidate}`);
    }
  };

  const gotRemoteIceCandidate = (event) => {
    trace('remote ice callback');
    if (event.candidate) {
      window.localPeerConnection.addIceCandidate(event.candidate);
      trace(`Remote ICE candidate: \n ${event.candidate.candidate}`);
    }
  };

  const gotRemoteDescription = (desc) => {
    window.remotePeerConnection.setLocalDescription(desc);
    trace(`Answer from remotePeerConnection \n ${desc.sdp}`);
    window.localPeerConnection.setRemoteDescription(desc);
  };

  const gotLocalDescription = (desc) => {
    window.localPeerConnection.setLocalDescription(desc);
    trace(`Offer from localPeerConnection \n + ${desc.sdp}`);
    window.remotePeerConnection.setRemoteDescription(desc);
    window.remotePeerConnection.createAnswer(gotRemoteDescription, () => false);
  };

  const handleMessage = (event) => {
    trace(`Received message: ${event.data}`);
    document.getElementById('dataChannelReceive').value = event.data;
  };

  const handleReceiveChannelStateChange = () => {
    const readyState = receiveChannel.readyState;
    trace(`Receive channel state is : ${readyState}`);
  };

  const gotReceiveChannel = (event) => {
    trace('receive channel callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onclose = handleReceiveChannelStateChange;
  };

  const handleSendChannelStateChange = () => {
    const readyState = sendChannel.readyState;
    trace(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      dataChannelSend.disabled = false;
      dataChannelSend.focus();
      dataChannelSend.placeholder = '';
      sendButton.disabled = false;
      closeButton.disabled = false;
    } else {
      dataChannelSend.disabled = true;
      sendButton.disabled = true;
      closeButton.disabled = true;
    }
  };

  window.localPeerConnection = new RTCPeerConnection(servers,
    {'optional': [{'RtpDataChannels': true}]});
  trace('Created local peer connection object localPeerConnection');
  try {
    sendChannel = window.localPeerConnection.createDataChannel('sendDataChannel',
      {'reliable': false});
    trace('Created send data channel');
  } catch (error) {
    alert('Failed to create data channel.' +
      ' need Chrome M25 or later with RtpDataChannel enabled.');
    trace(`createDataChannel() failed with exception: ${error.message}`);
  }
  window.localPeerConnection.onicecandidate = gotLocalCandidate;
  sendChannel.onopen = handleSendChannelStateChange;
  sendChannel.onclose = handleSendChannelStateChange;

  window.remotePeerConnection = new RTCPeerConnection(servers,
    {'optional': [{'RtpDataChannels': true}]});
  trace('Created remote peer connection object remotePeerConnection');

  window.remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  window.remotePeerConnection.ondatachannel = gotReceiveChannel;

  window.localPeerConnection.createOffer(gotLocalDescription, () => false);
  startButton.disabled = true;
  closeButton.disabled = false;
};

const sendData = () => {
  const data = dataChannelSend.value;
  sendChannel.send(data);
  trace(`Send data: ${data}`);
};

const closeDataChannels = () => {
  trace('Closing data channels');
  sendChannel.close();
  trace(`Closed data channel with label: ${sendChannel.label}`);
  receiveChannel.close();
  trace(`Closed data channel with label: ${receiveChannel.label}`);
  window.localPeerConnection.close();
  window.remotePeerConnection.close();
  window.localPeerConnection = null;
  window.remotePeerConnection = null;
  trace('Closed peer connections');
  startButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
  dataChannelSend.placeholder = 'Press Start, enter some text, then press Send.';
};

$(() => {
  init();

  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;

  startButton.onclick = createConnection;
  sendButton.onclick = sendData;
  closeButton.onclick = closeDataChannels;
});
