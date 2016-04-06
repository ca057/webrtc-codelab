let localStream = {};
let localPeerConnection = {};
let remotePeerConnection = {};
let localVideo = {};
let remoteVideo = {};
let startButton = {};
let callButton = {};
let hangupButton = {};
const constraints = {'video': true};

const init = () => {
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  startButton = document.getElementById('startButton');
  callButton = document.getElementById('callButton');
  hangupButton = document.getElementById('hangupButton');
};

const trace = (text) => {
  console.log(`${(performance.now() / 1000).toFixed(3)}: ${text}`);
};

const gotStream = (stream) => {
  trace('Receive local stream');
  localStream = stream;
  localVideo.src = URL.createObjectURL(localStream);
  callButton.disabled = false;
};

$(() => {
  init();

  startButton.disabled = false;
  callButton.disabled = true;
  hangupButton.disabled = true;

  startButton.onclick = () => {
    trace('Requesting local stream');
    startButton.disabled = true;
    getUserMedia(constraints,
      gotStream,
      (error) => {
        trace(`getUserMedia error: ${error}`);
      });
  };

  callButton.onclick = () => {
    var servers = null;
    callButton.disabled = true;
    hangupButton.disabled = false;
    trace('Starting call');

    if (localStream.getVideoTracks().length > 0) {
      trace(`Using video device: ${localStream.getVideoTracks()[0].label}`);
    }

    (() => {
      localPeerConnection = new RTCPeerConnection(servers);
      trace('Created local peer connection object localPeerConnection');
      localPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
          trace(`Local ICE Candidate: \n ${event.candidate.candidate}`);
        }
      };
    })();

    (() => {
      remotePeerConnection = new RTCPeerConnection(servers);
      trace('Created remote peer connection object remotePeerConnection');
      remotePeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
          trace(`Remote ICE candidate: \n ${event.candidate.candidate}`);
        }
      };
      remotePeerConnection.onaddstream = (event) => {
        remoteVideo.src = URL.createObjectURL(event.stream);
        trace('Received remote stream');
      };
    })();

    (() => {
      localPeerConnection.addStream(localStream);
      trace('Added localStream to localPeerConnection');
      localPeerConnection.createOffer(
        (description) => {
          localPeerConnection.setLocalDescription(description);
          trace(`Offer from localPeerConnection: \n ${description.sdp}`);
          remotePeerConnection.setRemoteDescription(description);
          remotePeerConnection.createAnswer(
            (desc) => {
              remotePeerConnection.setLocalDescription(desc);
              trace(`Answer from remotePeerConnection: \n ${desc.sdp}`);
              localPeerConnection.setRemoteDescription(desc);
            },
            () => false
          );
        },
        () => false
      );
    })();
  };

  hangupButton.onclick = () => {
    trace('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
  };
});
