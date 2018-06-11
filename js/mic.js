// asking mic permission in a browser
function initMic() {
  if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(gotStream).catch(function(e){
      console.log('mediaDevices error', e)
  })
}

  // gets audio stream and handles it
  function gotStream(stream){
    audioContext = new AudioContext()
    var bufferSize = 2048
    var numberOfAudioChannels = 2


    var audioInput = audioContext.createMediaStreamSource(stream);
    if (audioContext.createJavaScriptNode) {
        inputPoint = audioContext.createJavaScriptNode(bufferSize, numberOfAudioChannels, numberOfAudioChannels);
    } else if (audioContext.createScriptProcessor) {
        inputPoint = audioContext.createScriptProcessor(bufferSize, numberOfAudioChannels, numberOfAudioChannels);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = bufferSize;
    analyserNode.smoothingTimeConstant = 1;
    audioInput.connect(analyserNode);

    // init game loop right after we get audio stream
    gameLoop();
}

// loop which gets frequency from audio stream and draws fractal
function gameLoop(time) {

  // console.log("loop")
  var freqData = new Uint8Array(2048)
  analyserNode.getByteTimeDomainData(freqData)

  var data = analyzer.analize(freqData)
  voiceType.draw(data.frequency)
  rafID = window.requestAnimationFrame(gameLoop)
}

