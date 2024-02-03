import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";
import appleSvg from "./images/collectible.js";
import dogSvg from "./images/player.js";

var socket = io();

const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const appleSize = 25;
const dogSize = 70;
const speed = 5;
const playerImages = new Map();
let appleColor = "";
let apple = new Image();

let players = [];

let collectible;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;

let getDistance = function (xObj1, yObj1, xObj2, yObj2) {
  var result = Math.sqrt(
    Math.pow(xObj2 - xObj1, 2) + Math.pow(yObj2 - yObj1, 2)
  );
  return result;
};

function rectangle(x, y, w, h) {
  context.beginPath();
  context.rect(x, y, w, h);
  context.strokeStyle = "white";
  context.stroke();
}

function text(text, px, x, y) {
  context.font = `${px}px 'Press Start 2P', cursive`;
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(text, x, y);
}

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  rectangle(minX, minY, maxX - minX, maxY - minY);

  let mainPlayer = players.filter((player) => player.id === socket.id);

  // check if exists because in the first frames it doesn't exists
  if (collectible && mainPlayer[0]) {
    // collectible.render(context);
    appleColor = collectible.color();

    context.drawImage(
      apple,
      collectible.x - appleSize / 2, // to have the coordinates in the middle of the apple
      collectible.y - appleSize / 2,
      appleSize,
      appleSize
    );

    players.forEach((data) => {
      const playerImage = playerImages.get(data.id);
      context.drawImage(
        playerImage,
        data.x - dogSize / 2,
        data.y - dogSize / 2,
        dogSize,
        dogSize
      );
    });

    if (
      getDistance(
        mainPlayer[0].x,
        mainPlayer[0].y,
        collectible.x,
        collectible.y
      ) <= appleSize
    ) {
      mainPlayer[0].collision(collectible);

      socket.emit("collect");
    }
  }
  // console.log(mainPlayer[0]);

  text("Controls: WASD", 14, 105, 35);
  text("Apple Race", 18, canvas.width / 2, 35);
  if (mainPlayer[0]) {
    text(mainPlayer[0].calculateRank(players, mainPlayer[0]), 14, 550, 35);
  }

  // check if exists because in the first frames it doesn't exists
  if (mainPlayer[0]) {
    mainPlayer[0].movePlayer(speed, arrowUp, arrowDown, arrowLeft, arrowRight);
    socket.emit("updatePlayers", {
      id: mainPlayer[0].id,
      x: mainPlayer[0].x,
      y: mainPlayer[0].y,
      score: mainPlayer[0].score,
      color: mainPlayer[0].color,
    });
  }

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", function (e) {
  if (e.code === "ArrowUp" || e.code === "KeyW") arrowUp = true;
  if (e.code === "ArrowDown" || e.code === "KeyS") arrowDown = true;
  if (e.code === "ArrowLeft" || e.code === "KeyA") arrowLeft = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") arrowRight = true;
});

document.addEventListener("keyup", function (e) {
  if (e.code === "ArrowUp" || e.code === "KeyW") arrowUp = false;
  if (e.code === "ArrowDown" || e.code === "KeyS") arrowDown = false;
  if (e.code === "ArrowLeft" || e.code === "KeyA") arrowLeft = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") arrowRight = false;
});

socket.on("onCollect", (data) => {
  collectible = new Collectible({
    x: data.x,
    y: data.y,
    value: data.value,
    id: data.id,
  });
  appleColor = collectible.color();
  apple.src = appleSvg(appleColor);
});

socket.on("onUpdatePlayers", (updatedPlayers) => {
  updatedPlayers.forEach((player) => {
    // Check if an Image object exists for the player
    if (!playerImages.has(player.id)) {
      // If not, create a new Image object and set its source
      playerImages.set(player.id, new Image());
      playerImages.get(player.id).src = dogSvg(player.color);
    }
  });
  players = updatedPlayers.map((player) => {
    return new Player({
      id: player.id,
      x: player.x,
      y: player.y,
      score: player.score,
      color: player.color,
    });
  });
});

// console.log("giocatori", players);
animate();
