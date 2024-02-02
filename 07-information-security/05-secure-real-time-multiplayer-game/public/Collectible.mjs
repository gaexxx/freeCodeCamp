class Collectible {
  constructor({ x, y, value, id }) {
    this.id = id;
    this.value = value;
    this.x = x;
    this.y = y;
  }

  color() {
    let color = "";
    if (this.value === 1) color = "red";
    if (this.value === 2) color = "silver";
    if (this.value === 3) color = "gold";
    return color;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) {}

export default Collectible;
