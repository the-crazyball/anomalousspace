module.exports = class Hexagon {
    constructor(q, r, size) {
        this.q = q;
        this.r = r;
        this.size = size;

        this.centerPixel = this.pointy_hex_to_pixel()
        this.height = 2 * size
        this.width = size * Math.sqrt(3)
    }

    get relativeX() {
        return this.centerPixel.x
    }

    get relativeY() {
        return this.centerPixel.y
    }
    pointy_hex_to_pixel() {
        const x = this.size * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r)
        const y = this.size * (3 / 2 * this.r)
        return {x: x, y: y}
     }
   }