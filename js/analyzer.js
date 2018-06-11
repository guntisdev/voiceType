var Analyzer = Class.extend({
  init: function(){
    // define at what point starts silence
    this.thresholdSilence = Math.pow(10, -5)
  },

  analize: function (buffer) {
    var amplitude = this.getAmplitude(buffer)
    var bufferNormalized = this.normalizeTimeData(buffer)
    var buf = this.normalize(this.autoCorrelate(this.windowing(bufferNormalized)))
    var i = this.zeroCrossing(buf)
    var findmax = this.findMax(i, buf)

    var data = {
      frequency: this.getFrequency(findmax.index), 
      harmony: findmax.harmony, 
      decibels: this.getDecibels(bufferNormalized), 
      amplitude: amplitude, 
    }
    
    if(this.thresholdSilence > data.decibels) data.frequency = 0
    return data
  },

  // normalize buffer data from 8 bit to -1 1
  normalizeTimeData: function(freqData) {
    var buf = [];
    var l = freqData.length;

    for (var i = 0; i < l; i++) {
        buf[i] = freqData[i] / 127.5 - 1;
    }
    return buf;
  },

  // sound wave amplitude
  getAmplitude: function(audioStream) {
    var sum = 0
    for(var i=0; i<audioStream.length; i++){
        sum += Math.abs(audioStream[i])
    }
    return sum
  },

  // find correlation in audio signal 
  autoCorrelate: function(buf) {
    var sum, i, j;
    var R = [];
    for (i = 0, l = 2048; i < l; i++) {
        sum = 0;
        for (j = 0; j < l - i; j++) {
            if (j > 0 && j < l || j + i > 0 && j + i < l)
                sum += buf[j] * buf[j + i];
            else continue;

        }
        R[i] = sum;
    }
    return R;
  },

  // normalize data so there is no value outside of -1 1 range
  normalize: function(arr) {
    var temp = 0;
    var l = arr.length;
    for (var i = 0; i < l; i++) {
        if (Math.abs(arr[i]) > temp) temp = Math.abs(arr[i]);
    }
    for (var j = 0; j < l; j++)
        arr[j] = arr[j] / temp;

    return arr;
  },

  // get audio wave crossing 0 on y axis
  zeroCrossing: function(buf) {
    var l = buf.length;
    for (var i = 0; i < l; i++) {
        if (buf[i] <= 0) return i;
    }
  },

  // find maximum points in audio buffer
  findMax: function(i, buf) {
    var l = buf.length;
    var max = 0;
    var maxInd = 0;
    for (var j = i; j < l; j++) {
        if (buf[j] > max) {
            max = buf[j];
            maxInd = j;
        }
    }
    return {index: maxInd, harmony: buf[maxInd]};
  },

  getFrequency: function(maxInd) {
    return audioContext.sampleRate / maxInd;
  },

  // for better precision window start and end of the array
  windowing: function (buf) {
    var gauswin = [];
    for (var i = 0, l = buf.length; i < l; i++) {
        gauswin[i] = Math.pow(Math.E, -0.5 * (Math.pow((i - (l - 1) / 2) / (0.45 * (l - 1) / 2), 2)));
        buf[i] = buf[i] * gauswin[i];
    }
    return buf;
  },

  // audio loudness
  getDecibels: function(db) {
    var l = db.length;
    var sum = 0;
    for (var i = 0; i < l; i++) {
        sum += Math.pow(db[i], 2);
    }
    return sum /= analyserNode.fftSize;
  },


})