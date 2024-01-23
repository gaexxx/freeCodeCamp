const mongoose = require("mongoose");

const Thread = mongoose.model("Thread", {
  board: { type: String },
  text: { type: String },
  created_on: { type: Date },
  bumped_on: { type: Date },
  reported: { type: Boolean },
  delete_password: { type: String },
  replies: [
    {
      // _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      text: { type: String },
      created_on: { type: Date },
      delete_password: { type: String },
      reported: { type: Boolean },
    },
  ],
  replycount: { type: Number },
});
module.exports = Thread;
