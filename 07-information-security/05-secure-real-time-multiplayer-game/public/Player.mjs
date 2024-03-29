const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const dogSize = 70;
const dogOneThird = dogSize / 3; // to let the player move close to the border

class Player {
  constructor({ x, y, score, id, color }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.color = color;
  }

  // manage movement in 8 directions
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

    if (
      this.x + sl >= minX + dogOneThird &&
      this.x + sr <= maxX - dogOneThird
    ) {
      this.x += sl + sr;
    }

    if (
      this.y + su >= minY + dogOneThird &&
      this.y + sd <= maxY - dogOneThird
    ) {
      this.y += su + sd;
    }
  }

  collision(item) {
    if (item.value === 1) this.score += 1;
    if (item.value === 2) this.score += 2;
    if (item.value === 3) this.score += 3;
    return true;
  }

  // sort the player array by score and find the score of the player who's playing
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
