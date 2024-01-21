"use strict";

const mongoose = require("mongoose");
const { createHmac } = require("node:crypto");
const Stock = require("./mongooseStockModel.js");

module.exports = function (app) {
  app.route("/api/stock-prices/").get(async function (req, res) {
    const { stock, like } = req.query;

    if (!stock) {
      return res.send("Please fill out the field/s");
    }

    // in case we want to clean the collection from all its documents
    // Stock.deleteMany({}) // con {} si intende tutte le proprietà
    //   .then((data) => {
    //     console.log(data);
    //     res.send("complete delete successful");
    //   })
    //   .catch((err) => console.log(err));
    // return;

    console.log(stock, like);
    let likes = 0;
    const hashedIp = createHmac(
      "sha256",
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip
    )
      .update("ciao")
      .digest("hex");

    if (like === "true") {
      likes = 1;
    }

    //// Compare 2 stocks and get relative likes ////
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
            clientIp: [
              { hashedIp, stockLiked: like === "true" ? true : false },
            ],
          });
          const savedStock = await newStock.save();
          console.log(savedStock);
          console.log("Stock1 saved");
        } else if (foundStock1) {
          let sameIdFound = foundStock1.clientIp.filter(
            (value) => value.hashedIp === hashedIp
          )[0];
          if (sameIdFound) {
            foundStock1.likes += sameIdFound.stockLiked ? 0 : likes;
            let targetClient =
              foundStock1.clientIp[foundStock1.clientIp.indexOf(sameIdFound)];
            targetClient.stockLiked =
              like === "true" ? true : targetClient.stockLiked;
          } else if (!sameIdFound) {
            foundStock1.clientIp.push({
              hashedIp,
              stockLiked: like === "true" ? true : false,
            });
          }
          const savedStock = await foundStock1.save();
          console.log(savedStock);
          console.log("Stock1 likes added");
        }
        if (!foundStock2) {
          let newStock = new Stock({
            stock: stock[1],
            likes: likes,
            clientIp: [
              { hashedIp, stockLiked: like === "true" ? true : false },
            ],
          });
          const savedStock = await newStock.save();
          console.log(savedStock);
          console.log("Stock2 saved");
        } else if (foundStock2) {
          let sameIdFound = foundStock2.clientIp.filter(
            (value) => value.hashedIp === hashedIp
          )[0];
          if (sameIdFound) {
            foundStock2.likes += sameIdFound.stockLiked ? 0 : likes;
            let targetClient =
              foundStock2.clientIp[foundStock2.clientIp.indexOf(sameIdFound)];
            targetClient.stockLiked =
              like === "true" ? true : targetClient.stockLiked;
          } else if (!sameIdFound) {
            foundStock2.clientIp.push({
              hashedIp,
              stockLiked: like === "true" ? true : false,
            });
          }
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
            stock: stock[0].toUpperCase(),
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
            stock: stock[1].toUpperCase(),
            price: data2.latestPrice,
            rel_likes: foundStock2.likes,
          });
        }
        // sort the array elements by the number of likes
        stockData.sort((a, b) => b.rel_likes - a.rel_likes);
        // the rel_likes of the second element will be the difference between the likes of
        // the more liked stock and the likes of the less liked stock
        stockData[1].rel_likes -= stockData[0].rel_likes;
        res.json({
          stockData: [stockData[0], stockData[1]],
        });
      } catch (error) {
        console.log(error);
      }
      return;
    }

    //// Get single stock price and total likes ////
    try {
      const foundStock = await Stock.findOne({ stock: stock });
      if (!foundStock) {
        let newStock = new Stock({
          stock: stock,
          likes: likes,
          clientIp: [{ hashedIp, stockLiked: like === "true" ? true : false }],
        });
        const savedStock = await newStock.save();
        console.log(savedStock);
        console.log("Stock saved");
        // res.json({ stock: data.stock, title: data.title });
      } else {
        let sameIdFound = foundStock.clientIp.filter(
          (value) => value.hashedIp === hashedIp
        )[0];
        if (sameIdFound) {
          foundStock.likes += sameIdFound.stockLiked ? 0 : likes;
          let targetClient =
            foundStock.clientIp[foundStock.clientIp.indexOf(sameIdFound)];
          targetClient.stockLiked =
            like === "true" ? true : targetClient.stockLiked;
        } else if (!sameIdFound) {
          foundStock.clientIp.push({
            hashedIp,
            stockLiked: like === "true" ? true : false,
          });
        }
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
