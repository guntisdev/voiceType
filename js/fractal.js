// visualization for voice frequency
var Fractal = Class.extend({
  init: function () {
    this.canvas = document.querySelector("#canvas")
    this.ctx = this.canvas.getContext("2d")
    this.calcValues()
    this.setParams()
    this.smallRect = new Rct(this.pixelSize)
    this.preloadImg()
  },

  preloadImg: function () {
    var self = this
    this.img = new Image;
    this.img.onload = function () {
      self.isImageLoaded = true
      self.draw(0)
    }
    this.img.src = "./assets/fractal.png"
  },


  // called from voiceType.js 60 times a second
  draw: function (frequency) {
    if (this.img.src) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(this.img, this.originX - this.fractalSize / 2, this.originY - this.fractalSize / 2, this.fractalSize, this.fractalSize)
      if(frequency){
        var midiKey = Math.round(this.freqToMidi(frequency))
        this.drawNote(midiKey)
      }
    }
  },

  drawNote: function (midiKey) {
    var min = 36
    var max = min + 12 * 4 - 1
    if (midiKey < min) midiKey = min
    if (midiKey > max) midiKey = max
    var quadrant = Math.floor((midiKey - min) / 12)
    var note = midiKey % 12

    var offsetX = this.pixelSize + (31 - note * 2) * this.pixelSize
    var offsetY = this.pixelSize + (note * 2 + 6) * this.pixelSize

    if (quadrant == 0) {
      offsetX += this.pixelSize
      offsetY += this.pixelSize
    }
    else if (quadrant == 1) offsetX += this.pixelSize
    else if (quadrant == 3) offsetY += this.pixelSize

    // swap offset X and Y if first or third quadrant
    if (quadrant == 1 || quadrant == 3) {
      var tmp = offsetX
      offsetX = offsetY
      offsetY = tmp
    }

    var dir = this.directions[quadrant]
    var xDir = dir[0]
    var yDir = dir[1]
    var quadrantColor = this.colors[quadrant]

    var topX = this.originX + offsetX * xDir
    var topY = this.originY + offsetY * yDir
    this.smallRect.setPosition(topX, topY)
    this.smallRect.setOrigin(0, 0)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    topX -= this.pixelSize * xDir
    topY -= this.pixelSize * yDir
    this.smallRect.setPosition(topX, topY)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    topX -= 2 * this.pixelSize * xDir;
    topY -= 2 * this.pixelSize * yDir;
    this.smallRect.setPosition(topX, topY)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    this.smallRect.setPosition(topX+this.pixelSize*xDir, topY)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    this.smallRect.setPosition(topX, topY+this.pixelSize*yDir)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    topX -= this.pixelSize * xDir;
    topY -= this.pixelSize * yDir;
    this.smallRect.setPosition(topX, topY)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)

    this.drawNeighborNote(midiKey-1)
    this.drawNeighborNote(midiKey+1)
  },

  drawNeighborNote: function(midiKey){
    var min = 36
    var max = min + 12*4-1
    if(midiKey < min) return
    if(midiKey > max) return
    var quadrant = Math.floor((midiKey-min) / 12)
    var note = midiKey%12
    
    var offsetX = this.pixelSize + (27-note*2) * this.pixelSize
    var offsetY = this.pixelSize + (note*2+2) * this.pixelSize
    
    // hack, because rect doesn't have origin
    if(quadrant == 0) {
        offsetX += this.pixelSize
        offsetY += this.pixelSize
    }
    else if(quadrant == 1) offsetX += this.pixelSize
    else if(quadrant == 3) offsetY += this.pixelSize
    
    // swap offset X and Y if first or third quadrant
    if(quadrant == 1 || quadrant == 3){
        var tmp = offsetX
        offsetX = offsetY
        offsetY = tmp
    }
    
    var dir = this.directions[quadrant]
    var xDir = dir[0]
    var yDir = dir[1]
    
    var topX = this.originX+offsetX*xDir
    var topY = this.originY+offsetY*yDir
    
    var quadrantColor = this.colors[quadrant]
    
    this.smallRect.setOrigin(0, 0)
    this.smallRect.setPosition(topX, topY)
    this.smallRect.setColor(quadrantColor[0])
    this.smallRect.draw(this.ctx)
  },


  freqToMidi: function (frequency) {
    var midi = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69
    return (midi >= 21 && midi <= 108) ? midi : 0
  },

  calcValues: function () {
    this.fractalPixels = 57
    this.offsetPixels = 6
    this.pixelSize = this.canvas.width / (this.fractalPixels + 2 * this.offsetPixels)
    this.originX = this.canvas.width / 2
    this.originY = this.canvas.height / 2
    this.fractalSize = this.pixelSize * this.fractalPixels
  },

  setParams: function () {
    this.origins = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]

    this.directions = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]

    this.colors = [
      ["#629fb5", "#68c4c0", "#aee0df"],
      ["#942d6c", "#ff5d78", "#ffcac1"],
      ["#ef8f00", "#f9ce45", "#e9d07a"],
      ["#d76c24", "#ef8f00", "#ffb356"],
    ]
  },

})