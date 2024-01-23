const bcrypt = require("bcrypt");
const saltRounds = 12;
const hash = (pass) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(pass, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};
const compare = (pass, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pass, hash, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

module.exports = { hash, compare };
