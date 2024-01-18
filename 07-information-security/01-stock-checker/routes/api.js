"use strict";

const mongoose = require("mongoose");

module.exports = function (app) {
  const Stock = mongoose.model("Stock", {
    stock: { type: String },
    likes: { type: Number },
  });

  app.route("/api/stock-prices/").get(async function (req, res) {
    const { stock, like } = req.query;
    console.log(stock, like);
    let likes = 0;
    if (like === "true") {
      likes = 1;
    }
    try {
      const foundStock = await Stock.findOne({ stock: stock });
      if (!foundStock) {
        let newStock = new Stock({
          stock: stock,
          likes: likes,
        });
        const savedStock = await newStock.save();
        console.log(savedStock);
        console.log("Stock saved");
        // res.json({ stock: data.stock, title: data.title });
      } else {
        foundStock.likes += likes;
        const savedStock = await foundStock.save();
        console.log(savedStock);
        console.log("Stock likes added");
      }
    } catch (err) {
      console.log(err);
    }
    try {
      const result = await fetch(
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock.toUpperCase()}/quote`
      );
      if (!result.ok) {
        const msg = `C'e stato un errore ${result.status} ${result.statusText}`;
        throw new Error(msg);
      }
      const data = await result.json();
      const foundStock = await Stock.findOne({ stock: stock });
      if (!foundStock) {
        console.log("no stock found");
      }

      res.json({
        stockData: {
          stock: stock.toUpperCase(),
          price: data.latestPrice,
          likes: foundStock.likes,
        },
      });
    } catch (error) {
      console.log(error);
    }
  });
};
