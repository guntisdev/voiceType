// abstraction to draw rectangles on canvas
var Rct = Class.extend({
  init: function(size){
    this.size = size
    this.x = 0
    this.y = 0
    this.originX = this.originY = 0
    this.color = "#ff0000"
  },

  getSize: function() { return this.size },

  setPosition: function(x, y) {
    this.x = x
    this.y = y
  },

  setOrigin: function(originX, originY) {
    this.originX = originX
    this.originY = originY
  },

  setColor: function(color) { this.color = color },

  draw: function(ctx) {
      var x = this.x - this.originX * this.size
      var y = this.y - this.originY * this.size

      ctx.fillStyle = this.color
      ctx.fillRect(x, y, this.size, this.size)
  },

})
