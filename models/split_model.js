const sqlBind = require("../util/sqlBind");

const createSplit = async (splitData) => {
  const result = await sqlBind(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};
const updateSplitStatus = async (spiltId) => {
  const sql = `UPDATE split SET status=1 WHERE id < ?;`;
  const bind = [spiltId];
  const result = await sqlBind(sql, bind);
  return result.insertId;
};
const settleSplitStatus = async (spiltId) => {
  const sql = `UPDATE split SET status=1 where account_id IN  (SELECT * FROM (SELECT account_id FROM cash_flows.split where id=?) as s);`;
  const bind = [spiltId];
  const result = await sqlBind(sql, bind);
  return result;
};
module.exports = {
  createSplit,
  updateSplitStatus,
  settleSplitStatus,
};
