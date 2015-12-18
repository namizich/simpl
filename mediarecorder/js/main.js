'use strict';

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var constraints = {
  audio: true,
  video: true
};

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
var cameraOffButton = document.querySelector('button#cameraOff');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;
cameraOffButton.onlick = cameraOff;

// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol !== 'https:' ||
location.host !== 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream; // make available to browser console
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}).catch(function(error) {
  console.log('navigator.getUserMedia error: ', error);
});

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
    console.assert(mediaRecorder.state === 'recording',
      'State should be "recording"');
  } else {
    console.assert(mediaRecorder.state === 'inactive',
      'State should be "inactive"');
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

function startRecording() {
  var options = {mimeType: 'video/vp9'};
  try {
    recordedBlobs = [];
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    try {
      options = 'video/vp8'; // Chrome 47
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (event) {
      alert('MediaRecorder is not supported by this browser.\n\n' +
        'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
      console.error('Exception while creating MediaRecorder:', event);
      return;
    }
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  console.assert(mediaRecorder.state === 'inactive');
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
  console.assert(mediaRecorder.state === 'recording');
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
}

function play() {
  var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
