const pool = require("../database");

const createSplit = async (splitData) => {
  const [result] = await pool.query(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status, current_balance, is_calculated, is_handwrited) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};

const createBalancedSplit = async (bookId, splitData) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let sql = `UPDATE cash_flows.split AS s
  INNER JOIN cash_flows.account AS a ON s.account_id = a.id
  SET s.status = 1
  WHERE s.is_handwrited = 0 and a.book_id =?`;
    await conn.query(sql, bookId);
    const [result] = await conn.query(
      `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status, split_start, split_end, current_balance, is_calculated,is_handwrited) VALUES ?`,
      [splitData]
    );
    await conn.query("COMMIT");
    return result.insertId;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
    return -1;
  } finally {
    await conn.release();
  }
};

const getBalanceList = async (bookId) => {
  const sql = `SELECT account.date as date,t.id as splitId, account.id as account_id, a.NAME as user, b.NAME as paidUser, t.balance \
  FROM split t\
  JOIN user a ON t.user_id =a.id\
  JOIN user b ON t.paid_user_id = b.id\
  INNER JOIN account ON t.account_id = account.id\
  WHERE  (t.user_id!=t.paid_user_id) and account.book_id=? and t.is_calculated=0\
  ORDER by date DESC`;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getGroupBalanceList = async (bookId) => {
  const sql = `SELECT user.id, user.name, sum(split.balance+split.current_balance) as balance FROM cash_flows.split INNER JOIN account ON split.account_id=account.id INNER JOIN user
  ON split.user_id=user.id  where account.book_id= ? and split.is_calculated =0 group by split.user_id ;
  `;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getBalanceRange = async (bookId) => {
  const [result] = await pool.query(
    `SELECT min(split.id) as min, max(split.id) as max FROM cash_flows.split INNER JOIN cash_flows.account ON split.account_id = account.id where split.status = 0 and account.book_id =?;
    `,
    [bookId]
  );
  return result;
};

const updateSplitIsCalculated = async (splitId, bookId) => {
  const sql = `UPDATE split INNER JOIN account ON split.account_id = account.id SET is_calculated = 1 WHERE split.id < ? and account.book_id=?;`;
  const bind = [splitId, bookId];
  const [result] = await pool.query(sql, bind);
  return result.insertId;
};

const updateSettleStatus = async (bookId, userId, splitId, utcDate) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT account_id, user_id, paid_user_id, balance  FROM cash_flows.split WHERE split.id = ?",
      [splitId]
    );
    await conn.query(
      "UPDATE split SET status =1, is_calculated =1, split.current_balance = split.current_balance-? WHERE id =?",
      [result[0].balance, splitId]
    );
    await conn.query(
      "UPDATE split SET split.current_balance = split.current_balance+? WHERE id IN(Select * FROM (SELECT id FROM cash_flows.split WHERE account_id = ? and user_id = ?)as s)",
      [result[0].balance, result[0].account_id, result[0].paid_user_id]
    );
    await conn.query(
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
    if (userId != result[0].user_id) {
      await conn.query(
        `INSERT INTO message (settle_user_id,user_id, paid_user_id, amount, book_id, timestamp, read_status, notice_status) VALUES (?)`,
        [
          [
            userId,
            result[0].user_id,
            result[0].paid_user_id,
            -1 * parseInt(result[0].balance),
            bookId,
            utcDate,
            0,
            0,
          ],
        ]
      );
    }
    if (userId != result[0].paid_user_id) {
      await conn.query(
        `INSERT INTO message (settle_user_id,user_id, paid_user_id, amount, book_id, timestamp, read_status, notice_status) VALUES (?)`,
        [
          [
            userId,
            result[0].paid_user_id,
            result[0].user_id,
            parseInt(result[0].balance),
            bookId,
            utcDate,
            0,
            0,
          ],
        ]
      );
    }
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
    const [end] = await conn.query(
      "SELECT split_end FROM cash_flows.split where id=?",
      [splitId]
    );
    if (end[0].split_end !== null) {
      const [status] = await conn.query(
        "SELECT sum(status) as sum,count(status) as count FROM cash_flows.split where split_end=?",
        [end[0].split_end]
      );
      if (parseInt(status[0].sum) === parseInt(status[0].count)) {
        const [status] = await conn.query(
          "UPDATE split INNER JOIN account ON split.account_id = account.id SET status =1 WHERE split.id <=? and account.book_id = ?",
          [end[0].split_end, bookId]
        );
      }
    }
    await conn.query("COMMIT");
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
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
  getBalanceList,
  getGroupBalanceList,
  updateSplitIsCalculated,
  updateSettleStatus,
  checkSplitStatus,
};
