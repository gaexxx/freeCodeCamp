const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const r = 20;

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

  movePlayer(speed, arrowUp, arrowDown, arrowLeft, arrowRight) {
    let sl = 0;
    let sr = 0;
    let su = 0;
    let sd = 0;

    if (arrowLeft) sl = -speed;
    if (arrowRight) sr = speed;
    if (arrowUp) su = -speed;
    if (arrowDown) sd = speed;
    if (arrowUp && arrowLeft) {
      sl = -speed;
      su = -speed;
    }
    if (arrowUp && arrowRight) {
      sr = speed;
      su = -speed;
    }
    if (arrowDown && arrowLeft) {
      sl = -speed;
      sd = speed;
    }
    if (arrowDown && arrowRight) {
      sr = speed;
      sd = speed;
    }

    if (this.x + sl >= minX + r && this.x + sr <= maxX - r) {
      this.x += sl + sr;
    }

    if (this.y + su >= minY + r && this.y + sd <= maxY - r) {
      this.y += su + sd;
    }
  }

  collision(item) {
    if (item.value === 1) this.score += 1;
    if (item.value === 2) this.score += 2;
    if (item.value === 3) this.score += 3;
    return true;
  }

  calculateRank(arr, mainPlayer) {
    let playersSorted = arr.sort((a, b) => {
      return b.score - a.score;
    });
    let indexMainPlayer = playersSorted.findIndex(
      (player) => player.id === mainPlayer.id
    );
    return `Rank: ${indexMainPlayer + 1} / ${arr.length}`;
  }
}

export default Player;
