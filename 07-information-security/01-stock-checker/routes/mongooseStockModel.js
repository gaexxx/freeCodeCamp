const mongoose = require("mongoose");

const Stock = mongoose.model("Stock", {
  stock: { type: String },
  likes: { type: Number },
  clientIp: [{ hashedIp: { type: String }, stockLiked: { type: Boolean } }],
});

module.exports = Stock;
