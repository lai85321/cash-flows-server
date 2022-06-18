const db = require("../database");

const sqlBind = function (sql, value) {
  return new Promise((resolve, reject) => {
    db.query(sql, value, async (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = sqlBind;
