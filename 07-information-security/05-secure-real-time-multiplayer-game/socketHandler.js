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

const socketHandler = (server) => {
  const io = require("socket.io")(server);

  let players = [];

  io.on("connect", (socket) => {
    players.push({ id: socket.id, x: random.x(r), y: random.y(r), score: 0 });
    console.log("player connessi: ", players);

    socket.on("updatePlayers", (data) => {
      // console.log(data.id);
      const index = players.findIndex((player) => player.id === data.id);
      if (index !== -1) {
        players[index] = data;
      }
      io.emit("onUpdatePlayers", players);
    });
    io.emit("onUpdatePlayers", players);

    socket.on("collect", (data) => {
      players.forEach((player) => {
        if (player.id !== socket.id) {
          io.emit("onCollect", data);
        }
      });
    });

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
