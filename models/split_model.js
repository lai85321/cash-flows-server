const sqlBind = require("../util/sqlBind");
const pool = require("../database");

const createSplit = async (splitData) => {
  const result = await pool.query(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status, current_balance) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};
const updateSplitStatus = async (splitId) => {
  const sql = `UPDATE split SET status=1 WHERE id < ?;`;
  const bind = [splitId];
  const [result] = await pool.query(sql, bind);
  return result.insertId;
};
const settleSplitStatus = async (splitId) => {
  //const sql = `UPDATE split SET status=1 where account_id IN  (SELECT * FROM (SELECT account_id FROM cash_flows.split where id=?) as s);`;
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT account_id, paid_user_id, balance  FROM cash_flows.split WHERE split.id = ?",
      [splitId]
    );
    console.log(result);
    await conn.query(
      "UPDATE split SET status =1, split.current_balance = split.current_balance-? WHERE id =?",
      [result[0].balance, splitId]
    );
    await conn.query(
      "UPDATE split SET split.current_balance = split.current_balance+? WHERE id IN(Select * FROM (SELECT id FROM cash_flows.split WHERE account_id = ? and user_id = ?)as s)",
      [result[0].balance, result[0].account_id, result[0].paid_user_id]
    );
    const [updateResult] = await conn.query(
      "SELECT id, balance, current_balance FROM split WHERE id IN(Select * FROM (SELECT id FROM cash_flows.split WHERE account_id = ? and user_id = ?)as s)",
      [result[0].account_id, result[0].paid_user_id]
    );
    if (
      parseInt(updateResult[0].balance) +
        parseInt(updateResult[0].current_balance) ==
      0
    ) {
      await conn.query("UPDATE split SET status =1 WHERE id =?", [
        updateResult[0].id,
      ]);
    }
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }

  // const sql = `UPDATE split SET status=1  where id=?;`;
  // const bind = [splitId];
  // const result = await sqlBind(sql, bind);
  // return result;
};
module.exports = {
  createSplit,
  updateSplitStatus,
  settleSplitStatus,
};
