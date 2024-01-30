import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

var socket = io();

const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const minX = 5;
const maxX = 640 - 5; // canvas.width - 5
const minY = 50;
const maxY = 480 - 5; // canvas.height - 5
const r = 20;
const rCollectible = 5;

const random = {
  x: (radius) =>
    Math.floor(Math.random() * (maxX - radius - (minX + radius))) +
    (minX + radius),
  y: (radius) =>
    Math.floor(Math.random() * (maxY - radius - (minY + radius))) +
    (minY + radius),
  value: () => Math.floor(Math.random() * (4 - 1)) + 1,
};

let id = 0;

let player = new Player({ x: random.x(r), y: random.y(r), score: 0, id: 1 });
let players = [];
let collectible = new Collectible({
  x: random.x(rCollectible),
  y: random.y(rCollectible),
  value: random.value(),
  id,
});

let vxl = 0;
let vxr = 0;
let vyu = 0;
let vyd = 0;

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

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  collectible.render(context);

  rectangle(minX, minY, maxX - minX, maxY - minY);

  if (getDistance(player.x, player.y, collectible.x, collectible.y) <= r) {
    player.collision(collectible.value);
    id += 1;
    collectible.x = random.x(rCollectible);
    collectible.y = random.y(rCollectible);
    collectible.value = random.value();
    collectible.id;
    socket.emit("collect", collectible);
  }

  let mainPlayer = players.filter((player) => player.id === socket.id);

  players.forEach((data) => {
    data.render(context);
  });

  // check if exists because in the first frames it doesn't exists
  if (mainPlayer[0]) {
    mainPlayer[0].movePlayer(vxl, vxr, vyu, vyd);
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
  if (e.code === "ArrowUp") vyu = -5;
  if (e.code === "ArrowDown") vyd = 5;
  if (e.code === "ArrowLeft") vxl = -5;
  if (e.code === "ArrowRight") vxr = 5;
});

document.addEventListener("keyup", function (e) {
  if (e.code === "ArrowUp") vyu = 0;
  if (e.code === "ArrowDown") vyd = 0;
  if (e.code === "ArrowLeft") vxl = 0;
  if (e.code === "ArrowRight") vxr = 0;
});

socket.on("onCollect", (data) => {
  //   console.log("da evento:", data);
  collectible.x = data.x;
  collectible.y = data.y;
  collectible.value = data.value;
  collectible.id = data.id;
});

socket.emit("collect", collectible);

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
