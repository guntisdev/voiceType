var GENDER = { UNKNOWN: -1, MALE: 0, FEMALE: 1 }
var VOICE_TYPE = { SOPRANO: 0, ALTO: 1, TENOR: 2, BASS: 3 }
var VOICE_NAMES = ["soprāns", "alts", "tenors", "bass"]
var STATUSES = { GENDER_SELECT: 0, INSTRUCTION_1: 1, VOICE_LOW: 2, INSTRUCTION_2: 3, VOICE_HIGH: 4, RESULT: 5 }

var VoiceType = Class.extend({
  init: function(){
    this.gender = GENDER.UNKNOWN
    this.status = STATUSES.GENDER_SELECT
    this.canvas = document.querySelector("#canvas")
    this.ctx = this.canvas.getContext("2d")
    this.voiceLow = 0
    this.voiceHigh = 0
    this.voiceBuffer = []
    this.sampleCount = 90 // min sample count to get voice type
    this.fractal = new Fractal()

    this.refs = {
      instructionContainer: document.querySelector("#instructionContainer"),
      resultContainer: document.querySelector("#resultContainer"),
      genderContainer: document.querySelector("#genderContainer"),
    }

    var self = this
    document.querySelector("#genderMale").addEventListener("click", function(){
      self.selectGender(GENDER.MALE)
    })
    document.querySelector("#genderFemale").addEventListener("click", function(){
      self.selectGender(GENDER.FEMALE)
    })
  },

  draw: function(frequency){
    if(this.status == STATUSES.VOICE_LOW || this.status == STATUSES.VOICE_HIGH){
      this.catchLowHigh(frequency)
      this.fractal.draw(frequency)      
    } else this.fractal.draw(null)
  },

  // convert frequency to midi key
  freqToMidi: function (frequency) {
    var midi = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69
    return (midi >= 21 && midi <= 108) ? midi : 0
  },

  // gets low and high notes of voice
  catchLowHigh: function(frequency) {
    if(this.voiceLow == 0 || this.voiceHigh == 0){
      
      if(this.voiceBuffer.length > this.sampleCount) this.voiceBuffer.shift()
        var lastMidi = Math.round(this.freqToMidi(frequency))
        this.voiceBuffer.push(lastMidi)
        var count = 0
        for(var i=0; i<this.voiceBuffer.length; i++){
          if(lastMidi == this.voiceBuffer[i]) count++
        }
        // more than half of samples are same so this is stable note from voice
        if(count > this.sampleCount/2){
          this.setFromVoice(lastMidi)
        }
    }
  },

  // get low and high notes and calculate voice type
  setFromVoice: function(midiKey) {
    if(midiKey < 30){
        return;
    }
    else if(this.voiceLow == 0){
        this.voiceLow = midiKey
        this.voiceBuffer = []
        console.log("voice low: ", this.voiceLow)
        this.refs.instructionContainer.innerHTML = "Nodziedi augstu skaņu!"
        this.refs.instructionContainer.classList.remove("hidden")
        this.status = STATUSES.INSTRUCTION_2
        var self = this
        setTimeout(function(){ 
          self.refs.instructionContainer.classList.add("hidden")
          self.status = STATUSES.VOICE_HIGH
        }, 3000)
    }
    else if(this.voiceLow == midiKey){
        // do nothing, because low and high midi shouldn't be the same
    }
    else if(this.voiceHigh == 0){
        this.voiceHigh = midiKey
        console.log("voice high: ", this.voiceHigh)
        // in some awkward case just switch low and high
        if(this.voiceLow > this.voiceHigh){
            var tmp = this.voiceLow;
            this.voiceLow = this.voiceHigh;
            this.voiceHigh = tmp;
        }
        this.setVoiceType()
    }
  },

  setVoiceType: function() {
    var voiceId
    
    // male
    if(this.gender == 0){
        if(this.voiceLow < 48) voiceId = VOICE_TYPE.BASS
        else voiceId = VOICE_TYPE.TENOR
    }
    // female
    else {
        if(this.voiceHigh > 76) voiceId = VOICE_TYPE.SOPRANO
        else voiceId = VOICE_TYPE.ALTO
    }
    
    console.log("My voice type: ", voiceId);
    
    this.refs.resultContainer.classList.remove("hidden")
    this.refs.resultContainer.innerHTML = "Tavs balss tips ir " + VOICE_NAMES[voiceId]
  },

  selectGender: function(gender){
    this.gender = gender
    initMic()
    this.refs.genderContainer.classList.add("hidden")
    this.refs.instructionContainer.innerHTML = "Nodziedi zemu skaņu!"
    this.refs.instructionContainer.classList.remove("hidden")
    this.status = STATUSES.INSTRUCTION_1
    var self = this
    setTimeout(function(){ 
      self.refs.instructionContainer.classList.add("hidden")
      self.status = STATUSES.VOICE_LOW
    }, 3000)
  },

})