// import { render } from "../server";

const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");
class Collectible {
  constructor({ x, y, value, id }) {
    this.id = id;
    this.value = value;
    this.x = x;
    this.y = y;
  }

  render() {
    context.beginPath();
    context.arc(this.x, this.y, 5, 0, 2 * Math.PI); // cerchio
    if (this.value === 1) context.fillStyle = "brown";
    if (this.value === 2) context.fillStyle = "silver";
    if (this.value === 3) context.fillStyle = "gold";
    context.fill();
    context.stroke();
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
