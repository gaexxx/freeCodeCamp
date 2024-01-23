"use strict";
const mongoose = require("mongoose");
const Thread = require("./mongooseThreadModel.js");

module.exports = function (app) {
  app
    .route("/api/threads/:board")

    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      const newThread = new Thread({
        board,
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password,
        replies: [],
        replycount: 0,
      });

      try {
        await newThread.save();
        res.redirect(`/${board}`);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })

    // GET the most recent 10 bumped threads on the board
    .get(async (req, res) => {
      // in caso si voglia pulire la collection da tutti i documents
      // Thread.deleteMany({}) // con {} si intende tutte le proprietà
      //   .then((data) => {
      //     console.log(data);
      //     res.send("complete delete successful");
      //   })
      //   .catch((err) => console.log(err));
      // return;
      const { board } = req.params;

      try {
        const threads = await Thread.find({ board })
          .sort({ bumped_on: "desc" })
          .limit(10)
          .select(
            "-reported -delete_password -replies.reported -replies.delete_password"
          )
          .exec();

        res.json(threads);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

  app
    .route("/api/replies/:board")

    // POST a new reply
    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;
      console.log(req.params);
      console.log(req.body);

      try {
        const foundThread = await Thread.findById(thread_id);

        if (!foundThread) {
          res.json({ error: "Thread not found" });
          return;
        }

        foundThread.bumped_on = new Date();
        foundThread.replycount += 1;
        foundThread.replies.push({
          text,
          created_on: foundThread.bumped_on,
          delete_password,
          reported: false,
        });

        await foundThread.save();
        // if (board === thread_id) {
        //   res.redirect(`/a/${thread_id}`);
        // } else {
        res.redirect(`/${foundThread.board}/${thread_id}`);
        // }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    })

    // GET a thread with all its replies
    .get(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      try {
        const thread = await Thread.findById(thread_id)
          .select(
            "-reported -delete_password -replies.reported -replies.delete_password"
          )
          .exec();

        res.json(thread);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  app.route("/:board/").get(function (req, res) {
    res.sendFile(process.cwd() + "/views/board.html");
  });
  app.route("/:board/:threadid").get(function (req, res) {
    res.sendFile(process.cwd() + "/views/thread.html");
  });
};
