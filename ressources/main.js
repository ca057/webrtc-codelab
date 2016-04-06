var constraints = {'video': true};

var successCallback = (localMediaStream) => {
  var video = document.querySelector('video');
  window.stream = localMediaStream;
  video.src = window.URL.createObjectURL(localMediaStream);
  video.play();
};

var errorCallback = (error) => {
  console.error(`navigator.getUserMedia error: ${error}`);
};

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

$(() => {
  navigator.getUserMedia(constraints, successCallback, errorCallback);
});
