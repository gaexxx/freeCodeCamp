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
          .exec();
        const formattedThreads = threads.map((thread) => {
          // Only include the most recent 3 replies
          const recentReplies = thread.replies
            .sort((a, b) => b.created_on - a.created_on)
            .slice(0, 3)
            .map((reply) => ({
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on,
            }));

          return {
            _id: thread._id,
            board: thread.board,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replycount: thread.replycount,
            replies: recentReplies,
          };
        });

        res.json(formattedThreads);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    })

    .delete(async (req, res) => {
      const { thread_id, delete_password } = req.body;
      const foundThread = await Thread.findById(thread_id);
      if (delete_password === foundThread.delete_password) {
        const deletedThread = await Thread.deleteOne({ _id: thread_id });
        console.log(deletedThread);
        res.send("success");
      } else if (delete_password !== foundThread.delete_password) {
        res.send("incorrect password");
      }
    })

    .put(async (req, res) => {
      const { thread_id } = req.body;
      console.log(req.body);
      try {
        const updatedThread = await Thread.findOneAndUpdate(
          { _id: thread_id },
          { $set: { reported: true } },
          { new: true }
        );

        if (updatedThread) {
          console.log("Thread reported:", updatedThread);
          res.send("reported");
        } else {
          console.log("Thread not found");
          res.status(404).send("Thread not found");
        }
      } catch (error) {
        console.error("Error updating thread:", error);
        res.status(500).send("Internal Server Error");
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

        res.redirect(`/${foundThread.board}/${thread_id}`);
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
    })

    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const foundThread = await Thread.findById(thread_id);
      const foundReply = await foundThread.replies.find((reply) =>
        reply._id.equals(reply_id)
      );
      if (foundReply.text === "[deleted]") {
        res.send("reply already deleted");
        return;
      }

      if (delete_password === foundReply.delete_password) {
        const updatedThread = await Thread.findOneAndUpdate(
          { _id: thread_id, "replies._id": reply_id },
          { $set: { "replies.$.text": "[deleted]" } },
          { new: true }
        );
        if (updatedThread) {
          res.send("success");
          console.log(updatedThread);
        } else {
          res.send("something went wrong");
        }
      } else if (delete_password !== foundReply.delete_password) {
        res.send("incorrect password");
      }
    })

    .put(async (req, res) => {
      const { thread_id, reply_id } = req.body;
      try {
        const updatedThread = await Thread.findOneAndUpdate(
          { _id: thread_id, "replies._id": reply_id },
          { $set: { "replies.$.reported": true } },
          { new: true }
        );

        if (updatedThread) {
          console.log("Thread reported:", updatedThread);
          res.send("reported");
        } else {
          console.log("Thread not found");
          res.status(404).send("Thread not found");
        }
      } catch (error) {
        console.error("Error updating thread:", error);
        res.status(500).send("Internal Server Error");
      }
    });

  app.route("/:board/").get(function (req, res) {
    res.sendFile(process.cwd() + "/views/board.html");
  });
  app.route("/:board/:threadid").get(function (req, res) {
    res.sendFile(process.cwd() + "/views/thread.html");
  });
};
