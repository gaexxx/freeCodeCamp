"use strict";

const mongoose = require("mongoose");

module.exports = function (app) {
  const Stock = mongoose.model("Stock", {
    stock: { type: String },
    likes: { type: Number },
  });

  app.route("/api/stock-prices/").get(async function (req, res) {
    const { stock, like } = req.query;
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
    console.log(req.headers["x-forwarded-for"], req.connection.remoteAddress);
    console.log(stock, like);
    let likes = 0;
    if (like === "true") {
      likes = 1;
    }
    if (Array.isArray(stock)) {
      let stockData = [];
      if (stock.length !== 2) {
        return "Please enter 2 stocks";
      }
      try {
        const foundStock1 = await Stock.findOne({ stock: stock[0] });
        const foundStock2 = await Stock.findOne({ stock: stock[1] });
        if (!foundStock1) {
          let newStock = new Stock({
            stock: stock[0],
            likes: likes,
          });
          const savedStock = await newStock.save();
          console.log(savedStock);
          console.log("Stock1 saved");
          // res.json({ stock: data.stock, title: data.title });
        } else if (foundStock1) {
          foundStock1.likes += likes;
          const savedStock = await foundStock1.save();
          console.log(savedStock);
          console.log("Stock1 likes added");
        }
        if (!foundStock2) {
          let newStock = new Stock({
            stock: stock[0],
            likes: likes,
          });
          const savedStock = await newStock.save();
          console.log(savedStock);
          console.log("Stock2 saved");
          // res.json({ stock: data.stock, title: data.title });
        } else if (foundStock2) {
          foundStock2.likes += likes;
          const savedStock = await foundStock2.save();
          console.log(savedStock);
          console.log("Stock2 likes added");
        }
      } catch (err) {
        console.log(err);
      }
      try {
        const result1 = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[0].toUpperCase()}/quote`
        );
        const result2 = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[1].toUpperCase()}/quote`
        );
        if (!result1.ok || !result2.ok) {
          const msg = `C'e stato un errore ${result1.status} ${result1.statusText}`;
          throw new Error(msg);
        }
        const data1 = await result1.json();
        const data2 = await result2.json();
        console.log(data1.latestPrice, data2.latestPrice);
        const foundStock1 = await Stock.findOne({ stock: stock[0] });
        const foundStock2 = await Stock.findOne({ stock: stock[1] });
        if (typeof data1.latestPrice !== "number") {
          stockData.push({
            error: "invalid symbol",
            rel_likes: foundStock1.likes,
          });
        } else if (typeof data1.latestPrice === "number") {
          stockData.push({
            stock: stock[0],
            price: data1.latestPrice,
            rel_likes: foundStock1.likes,
          });
        }
        if (typeof data2.latestPrice !== "number") {
          stockData.push({
            error: "invalid symbol",
            rel_likes: foundStock2.likes,
          });
        } else if (typeof data2.latestPrice === "number") {
          stockData.push({
            stock: stock[1],
            price: data2.latestPrice,
            rel_likes: foundStock2.likes,
          });
        }
        stockData.sort((a, b) => b.rel_likes - a.rel_likes);
        stockData[1].rel_likes -= stockData[0].rel_likes;
        return res.json({
          stockData: [stockData[0], stockData[1]],
        });
      } catch (error) {
        console.log(error);
      }
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
      if (data === "Invalid symbol" || data === "Unknown symbol") {
        return res.json({
          stockData: { error: "invalid symbol", likes: foundStock.likes },
        });
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
