import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";
import svg from "./images/collectible.js";

var socket = io();

const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const r = 20;
const appleSize = 25;
const speed = 5;
let appleColor = "";
let apple = new Image();

let players = [];
let collectible;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;

let getDistance = function (xCircle1, yCircle1, xCircle2, yCircle2) {
  var result = Math.sqrt(
    Math.pow(xCircle2 - xCircle1, 2) + Math.pow(yCircle2 - yCircle1, 2)
  );
  return result;
};

function rectangle(x, y, w, h) {
  context.beginPath();
  context.rect(x, y, w, h);
  context.stroke();
}

function text(text, px, x, y) {
  context.font = `${px}px 'Press Start 2P', cursive`;
  context.fillStyle = "black";
  context.textAlign = "center";
  context.fillText(text, x, y);
}

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

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

  rectangle(minX, minY, maxX - minX, maxY - minY);

  players.forEach((data) => {
    data.render(context);
  });

  text("Controls: WASD", 14, canvas.width / 6, 35);
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
    });
  }

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", function (e) {
  if (e.code === "ArrowUp") arrowUp = true;
  if (e.code === "ArrowDown") arrowDown = true;
  if (e.code === "ArrowLeft") arrowLeft = true;
  if (e.code === "ArrowRight") arrowRight = true;
});

document.addEventListener("keyup", function (e) {
  if (e.code === "ArrowUp") arrowUp = false;
  if (e.code === "ArrowDown") arrowDown = false;
  if (e.code === "ArrowLeft") arrowLeft = false;
  if (e.code === "ArrowRight") arrowRight = false;
});

socket.on("onCollect", (data) => {
  collectible = new Collectible({
    x: data.x,
    y: data.y,
    value: data.value,
    id: data.id,
  });
  appleColor = collectible.color();
  apple.src = svg(appleColor);
});

socket.on("onUpdatePlayers", (updatedPlayers) => {
  players = updatedPlayers.map((player) => {
    return new Player({
      id: player.id,
      x: player.x,
      y: player.y,
      score: player.score,
    });
  });
});

// console.log("giocatori", players);
animate();
