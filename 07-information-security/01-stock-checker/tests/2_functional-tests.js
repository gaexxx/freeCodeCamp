const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const mongoose = require("mongoose");
const Stock = require("../routes/mongooseStockModel.js");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  // afterEach(() => {
  //   Stock.deleteMany({}).then();
  // });
  test("Viewing null stock: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices/")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.text, "Please fill out the field/s");
      });

    done();
  });
  test("Viewing one stock: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices?stock=GOOG")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.stockData.stock, "GOOG");
        assert.isAbove(res.body.stockData.price, 120);
        assert.deepEqual(res.body.stockData.likes, 0);
      });
    done();
  });
  test("Viewing one stock and liking it: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices?stock=goog&like=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.stockData.stock, "GOOG");
        assert.isAbove(res.body.stockData.price, 120);
        assert.deepEqual(res.body.stockData.likes, 1);
      });
    done();
  });
  test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices?stock=goog&like=true")
      .then(() => {
        chai
          .request(server)
          .keepOpen()
          .get("/api/stock-prices?stock=goog&like=true")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.stockData.stock, "GOOG");
            assert.isAbove(res.body.stockData.price, 120);
            assert.deepEqual(res.body.stockData.likes, 1);
          });
      });
    done();
  });
  test("Viewing two stocks: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices?stock=A&stock=B")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.lengthOf(res.body.stockData, 2);
        assert.deepEqual(res.body.stockData[0].stock, "A");
        assert.isAbove(res.body.stockData[0].price, 100);
        assert.deepEqual(res.body.stockData[0].rel_likes, 0);
        assert.deepEqual(res.body.stockData[1].stock, "B");
        assert.isAbove(res.body.stockData[1].price, 20);
        assert.deepEqual(res.body.stockData[1].rel_likes, 0);
      });
    done();
  });
  test("Viewing two stocks and liking them: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices?stock=c&stock=d&like=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.lengthOf(res.body.stockData, 2);
        assert.deepEqual(res.body.stockData[0].stock, "C");
        assert.isAbove(res.body.stockData[0].price, 40);
        assert.deepEqual(res.body.stockData[0].rel_likes, 1);
        assert.deepEqual(res.body.stockData[1].stock, "D");
        assert.isAbove(res.body.stockData[1].price, 30);
        assert.deepEqual(res.body.stockData[1].rel_likes, 0);
      });
    done();
  });
});
