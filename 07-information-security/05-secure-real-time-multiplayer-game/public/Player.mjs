const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const r = 20;
// let vxl = 0;
// let vxr = 0;
// let vyu = 0;
// let vyd = 0;

class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  render(context) {
    context.beginPath();
    context.arc(this.x, this.y, 20, 0, 2 * Math.PI); // cerchio
    context.fillStyle = "blue";
    context.fill();
    context.stroke();
  }

  movePlayer(vxl, vxr, vyu, vyd) {
    if (this.y <= minY + r) {
      vyu = 0;
    }
    if (this.y >= maxY - r) {
      vyd = 0;
    }
    if (this.x <= minX + r) {
      vxl = 0;
    }
    if (this.x >= maxX - r) {
      vxr = 0;
    }
    this.x += vxl;
    this.x += vxr;
    this.y += vyu;
    this.y += vyd;
  }

  collision(item) {
    if (item === 1) this.score += 1;
    if (item === 2) this.score += 2;
    if (item === 3) this.score += 3;
  }

  calculateRank(arr) {}
}

export default Player;
