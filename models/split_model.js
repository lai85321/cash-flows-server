const sqlBind = require("../util/sqlBind");
const pool = require("../database");

const createSplit = async (splitData) => {
  const [result] = await pool.query(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status, current_balance, is_calculated, is_handwrited) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};
const createBalancedSplit = async (splitData) => {
  const [result] = await pool.query(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status, split_start, split_end, current_balance, is_calculated,is_handwrited) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};

const getBalanceRange = async (bookId) => {
  const [result] = await pool.query(
    `SELECT min(split.id) as min, max(split.id) as max FROM cash_flows.split INNER JOIN cash_flows.account ON split.account_id = account.id where split.status = 0 and account.book_id =?;
    `,
    [bookId]
  );
  return result;
};
const updateSplitStatus = async (bookId) => {
  //const sql = `UPDATE split SET split.status=1 WHERE split.id in (SELECT split.id FROM cash_flows.split INNER JOIN cash_flows.account ON split.account_id = account.id WHERE is_handwrited = 0 and account.book_id =?)`;
  const sql = `UPDATE cash_flows.split AS s
  INNER JOIN cash_flows.account AS a ON s.account_id = a.id
  SET s.status = 1
  WHERE s.is_handwrited = 0 and a.book_id =?`;
  const [result] = await pool.query(sql, bookId);
  return result.insertId;
};

const updateSplitIsCalculated = async (splitId) => {
  const sql = `UPDATE split SET is_calculated = 1 WHERE id < ?;`;
  const bind = [splitId];
  const [result] = await pool.query(sql, bind);
  return result.insertId;
};

const settleSplitStatus = async (bookId, splitId, utcDate) => {
  //const sql = `UPDATE split SET status=1 where account_id IN  (SELECT * FROM (SELECT account_id FROM cash_flows.split where id=?) as s);`;
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT account_id, user_id, paid_user_id, balance  FROM cash_flows.split WHERE split.id = ?",
      [splitId]
    );
    await conn.query(
      "UPDATE split SET status =1,  is_calculated =1, split.current_balance = split.current_balance-? WHERE id =?",
      [result[0].balance, splitId]
    );
    await conn.query(
      "UPDATE split SET split.current_balance = split.current_balance+? WHERE id IN(Select * FROM (SELECT id FROM cash_flows.split WHERE account_id = ? and user_id = ?)as s)",
      [result[0].balance, result[0].account_id, result[0].paid_user_id]
    );
    await pool.query(
      `INSERT INTO account (book_id, paid_user_id, tag_id, type_id, amount, date, split, note, is_ignored) VALUES (?),(?)`,
      [
        [
          bookId,
          result[0].paid_user_id,
          4,
          3,
          result[0].balance,
          utcDate,
          0,
          "settle",
          0,
        ],
        [
          bookId,
          result[0].user_id,
          4,
          3,
          -1 * result[0].balance,
          utcDate,
          0,
          "settle",
          0,
        ],
      ]
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
      await conn.query(
        "UPDATE split SET status =1, is_calculated =1 WHERE id =?",
        [updateResult[0].id]
      );
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
};

const checkSplitStatus = async (bookId, startTime, endTime) => {
  const sql = `SELECT split.account_id as id, (sum(split.status)=count(split.status)) as status FROM cash_flows.account
  INNER JOIN cash_flows.split ON account.id=split.account_id 
  WHERE account.type_id=2 and account.book_id=? and account.date between ? and ?
  group by split.account_id`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

module.exports = {
  createSplit,
  createBalancedSplit,
  getBalanceRange,
  updateSplitStatus,
  updateSplitIsCalculated,
  settleSplitStatus,
  checkSplitStatus,
};
