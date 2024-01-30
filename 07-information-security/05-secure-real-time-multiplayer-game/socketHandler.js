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

let collectible;

const socketHandler = (server) => {
  const io = require("socket.io")(server);

  let players = [];

  io.on("connect", (socket) => {
    players.push({ id: socket.id, x: random.x(r), y: random.y(r), score: 0 });
    if (!collectible) {
      collectible = {
        id: 0,
        x: random.x(rCollectible),
        y: random.y(rCollectible),
        value: random.value(),
      };
    }

    socket.on("updatePlayers", (data) => {
      // console.log(data.id);
      const index = players.findIndex((player) => player.id === data.id);
      if (index !== -1) {
        players[index] = data;
      }
      io.emit("onUpdatePlayers", players);
    });
    io.emit("onUpdatePlayers", players);

    socket.on("collect", () => {
      collectible.id++;
      collectible.x = random.x(rCollectible);
      collectible.y = random.y(rCollectible);
      collectible.value = random.value();
      io.emit("onCollect", collectible);
    });
    io.emit("onCollect", collectible);

    socket.on("disconnect", (reason) => {
      const index = players.findIndex((player) => player.id === socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        io.emit("onUpdatePlayers", players);
      }
      console.log(
        "disconnected",
        socket.id,
        "\n",
        "player connessi: ",
        players
      );
    });
  });

  return io;
};

module.exports = socketHandler;
