const sqlBind = require("../util/sqlBind");
const pool = require("../database");

const getCurrencyList = async () => {
  const sql = `SELECT * FROM currency;`;
  const [result] = await pool.query(sql, "");
  return result;
};

module.exports = {
  getCurrencyList,
};
