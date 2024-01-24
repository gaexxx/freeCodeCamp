const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const mongoose = require("mongoose");
const server = require("../server");
const Thread = require("../routes/mongooseThreadModel.js");

chai.use(chaiHttp);

const timeNow = new Date();

suite("Functional Tests", function () {
  beforeEach(async () => {
    const deletedThread = await Thread.deleteMany({});
    // console.log(deletedThread);
  });
  test("Creating a new thread: POST request to /api/threads/{board} with done", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/threads/board1")
      .send({
        text: "trovare lavoro",
        delete_password: "ciao",
      })
      .end(async function (err, res) {
        assert.equal(res.status, 200);
        const foundThread = await Thread.findOne({ board: "board1" });
        assert.deepEqual(foundThread.board, "board1");
        assert.deepEqual(foundThread.text, "trovare lavoro");
        assert.isAbove(foundThread.created_on, timeNow);
        assert.deepEqual(foundThread.bumped_on, foundThread.created_on);
        assert.notDeepEqual(foundThread.delete_password, "ciao");
        assert.lengthOf(foundThread.replies, 0);
        assert.deepEqual(foundThread.replycount, foundThread.replies.length);
      });

    done();
  });
  test("Creating a new thread: POST request to /api/threads/{board}", async function () {
    const res = await chai.request(server).post("/api/threads/board1").send({
      text: "trovare lavoro",
      delete_password: "ciao",
    });

    assert.equal(res.status, 200);
    const foundThread = await Thread.findOne({ board: "board1" });
    assert.deepEqual(foundThread.board, "board1");
    assert.deepEqual(foundThread.text, "trovare lavoro");
    assert.isAbove(foundThread.created_on, timeNow);
    assert.deepEqual(foundThread.bumped_on, foundThread.created_on);
    assert.notDeepEqual(foundThread.delete_password, "ciao");
    assert.lengthOf(foundThread.replies, 0);
    assert.deepEqual(foundThread.replycount, foundThread.replies.length);
  });
  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", async function () {
    this.timeout(10000);
    for (let i = 0; i < 13; i++) {
      await chai
        .request(server)
        .post(`/api/threads/classe3a`)
        .send({
          text: "pulizie mensili" + " " + i,
          delete_password: "battisti",
        });
    }
    const foundThreads = await Thread.find({ board: "classe3a" });
    for (let i = 0; i < 6; i++) {
      await chai
        .request(server)
        .post(`/api/replies/classe3a`)
        .send({
          text: "lo faccio io" + i,
          delete_password: "ei",
          thread_id: foundThreads[foundThreads.length - 1]._id,
        });
    }
    const res = await chai.request(server).get("/api/threads/classe3a");
    // console.log(res.body);
    assert.lengthOf(foundThreads, 13);
    assert.lengthOf(res.body, 10);
    assert.deepEqual(res.body[0].text, "pulizie mensili 12");
    assert.deepEqual(res.body[0].replycount, 6);
    assert.lengthOf(res.body[0].replies, 3);
  });
  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", async function () {
    const res = await chai.request(server).post("/api/threads/board2").send({
      text: "caccia",
      delete_password: "ciao",
    });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const res2 = await chai
      .request(server)
      .delete("/api/threads/board2")
      .send({ thread_id: foundThread._id, delete_password: "c" });

    assert.equal(res.status, 200);
    assert.deepEqual(res2.text, "incorrect password");
  });
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", async function () {
    const res = await chai.request(server).post("/api/threads/board2").send({
      text: "caccia",
      delete_password: "ciao",
    });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const res2 = await chai
      .request(server)
      .delete("/api/threads/board2")
      .send({ thread_id: foundThread._id, delete_password: "ciao" });

    const foundDeletedThread = await Thread.findOne({ text: "caccia" });
    const foundThreads = await Thread.find({ board: "board2" });

    assert.equal(res.status, 200);
    assert.deepEqual(res2.text, "success");
    assert.isNull(foundDeletedThread);
    assert.lengthOf(foundThreads, 0);
  });
  test("Reporting a thread: PUT request to /api/threads/{board}", async function () {
    const res = await chai.request(server).post("/api/threads/board2").send({
      text: "caccia",
      delete_password: "ciao",
    });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const res2 = await chai
      .request(server)
      .put("/api/threads/board2")
      .send({ thread_id: foundThread._id });

    const foundThreadAgain = await Thread.findOne({ text: "caccia" });

    assert.equal(res.status, 200);
    assert.deepEqual(res2.text, "reported");
    assert.isTrue(foundThreadAgain.reported);
  });
  test("Creating a new reply: POST request to /api/replies/{board}", async function () {
    const resPostThread = await chai
      .request(server)
      .post("/api/threads/board2")
      .send({
        text: "caccia",
        delete_password: "ciao",
      });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const resPostReply = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io caccio fagiani",
        delete_password: "fagiano 72",
        thread_id: foundThread._id,
      });

    const res2 = await chai
      .request(server)
      .put("/api/threads/board2")
      .send({ thread_id: foundThread._id });

    const foundThreadAgain = await Thread.findOne({ text: "caccia" });

    assert.equal(resPostThread.status, 200);
    assert.equal(resPostReply.status, 200);
    assert.lengthOf(foundThreadAgain.replies, 1);
    assert.deepEqual(foundThreadAgain.replies[0].text, "io caccio fagiani");
    assert.deepEqual(foundThreadAgain.replycount, 1);
    assert.notDeepEqual(
      foundThreadAgain.created_on,
      foundThreadAgain.bumped_on
    );
  });
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", async function () {
    this.timeout(6000);
    const resPostThread = await chai
      .request(server)
      .post("/api/threads/board2")
      .send({
        text: "caccia",
        delete_password: "ciao",
      });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const resPostReply = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io caccio fagiani",
        delete_password: "fagiano 72",
        thread_id: foundThread._id,
      });
    const resPostReply2 = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io pesco",
        delete_password: "pesce",
        thread_id: foundThread._id,
      });
    const resPostReply3 = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io ho solo il capanno",
        delete_password: "verga",
        thread_id: foundThread._id,
      });
    const resPostReply4 = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io pettirossi",
        delete_password: "san",
        thread_id: foundThread._id,
      });

    const resGet = await chai
      .request(server)
      .get(`/api/replies/board2?thread_id=${foundThread._id}`);

    assert.equal(resPostReply.status, 200);
    assert.equal(resPostReply2.status, 200);
    assert.equal(resPostReply3.status, 200);
    assert.equal(resPostReply4.status, 200);
    assert.equal(resGet.status, 200);
    // console.log(resGet.body);
    assert.lengthOf(resGet.body.replies, 4);
    assert.deepEqual(resGet.body.replies[0].text, "io caccio fagiani");
    assert.deepEqual(resGet.body.replies[3].text, "io pettirossi");
    assert.deepEqual(resGet.body.replycount, 4);
    assert.notDeepEqual(resGet.body.created_on, resGet.bumped_on);
  });
  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", async function () {
    this.timeout(6000);
    const resPostThread = await chai
      .request(server)
      .post("/api/threads/board2")
      .send({
        text: "caccia",
        delete_password: "ciao",
      });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const resPostReply = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io caccio fagiani",
        delete_password: "fagiano 72",
        thread_id: foundThread._id,
      });

    const foundThreadAgain = await Thread.findOne({ text: "caccia" });

    const foundReply = foundThreadAgain.replies[0];
    // console.log(foundReply);

    const res = await chai.request(server).delete(`/api/replies/board2`).send({
      thread_id: foundThread._id,
      reply_id: foundReply._id,
      delete_password: "lal",
    });

    assert.equal(resPostThread.status, 200);
    assert.equal(resPostReply.status, 200);
    assert.equal(res.status, 200);
    assert.deepEqual(res.text, "incorrect password");
  });
  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", async function () {
    this.timeout(6000);
    const resPostThread = await chai
      .request(server)
      .post("/api/threads/board2")
      .send({
        text: "caccia",
        delete_password: "ciao",
      });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const resPostReply = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io caccio fagiani",
        delete_password: "fagiano 72",
        thread_id: foundThread._id,
      });

    const foundThreadAgain = await Thread.findOne({ text: "caccia" });

    const foundReply = foundThreadAgain.replies[0];
    // console.log(foundReply);

    const res = await chai.request(server).delete(`/api/replies/board2`).send({
      thread_id: foundThread._id,
      reply_id: foundReply._id,
      delete_password: "fagiano 72",
    });
    const foundThreadLast = await Thread.findOne({ text: "caccia" });

    const foundReplyAgain = foundThreadLast.replies[0];

    assert.equal(resPostThread.status, 200);
    assert.equal(resPostReply.status, 200);
    assert.equal(res.status, 200);
    assert.deepEqual(res.text, "success");
    assert.deepEqual(foundReplyAgain.text, "[deleted]");
  });
  test("Reporting a reply: PUT request to /api/replies/{board}", async function () {
    this.timeout(6000);
    const resPostThread = await chai
      .request(server)
      .post("/api/threads/board2")
      .send({
        text: "caccia",
        delete_password: "ciao",
      });

    const foundThread = await Thread.findOne({ text: "caccia" });

    const resPostReply = await chai
      .request(server)
      .post("/api/replies/board2")
      .send({
        text: "io caccio fagiani",
        delete_password: "fagiano 72",
        thread_id: foundThread._id,
      });

    const foundThreadAgain = await Thread.findOne({ text: "caccia" });

    const foundReply = foundThreadAgain.replies[0];
    // console.log(foundReply);

    const res = await chai.request(server).put(`/api/replies/board2`).send({
      thread_id: foundThread._id,
      reply_id: foundReply._id,
    });
    const foundThreadLast = await Thread.findOne({ text: "caccia" });

    const foundReplyAgain = foundThreadLast.replies[0];

    assert.equal(resPostThread.status, 200);
    assert.equal(resPostReply.status, 200);
    assert.equal(res.status, 200);
    assert.deepEqual(res.text, "reported");
    assert.isTrue(foundReplyAgain.reported);
  });
});
