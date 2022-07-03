const sqlBind = require("../util/sqlBind");
const pool = require("../database");

const createAccount = async (account) => {
  const [result] = await pool.query(
    `INSERT INTO account (book_id, paid_user_id, tag_id, type_id, amount, date, split, note, is_ignored) VALUES ?`,
    [account]
  );
  return result.insertId;
};

const getOverview = async (bookId, startTime, endTime) => {
  const sql = `SELECT type_id, sum(amount) as total FROM account WHERE book_id =? and is_ignored=0 and date between ? and ? group by type_id`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getAccountList = async (bookId, startTime, endTime) => {
  const sql = `SELECT account.*, tag.tag,user.name FROM cash_flows.account\
  INNER JOIN cash_flows.tag ON account.tag_id=tag.id\ 
  INNER JOIN cash_flows.user ON account.paid_user_id=user.id\ 
  WHERE account.book_id = ? and is_ignored=0 and date between ? and ?\
  order by account.date DESC`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getAccountDetail = async (accountId) => {
  const sql = `SELECT account.amount, a.name as paid_name, account.note, tag.tag, account.date, s.user_id, b.name as split_name, s.split, s.balance+s.current_balance as balance, s.status, s.is_calculated  FROM cash_flows.account\
  LEFT JOIN cash_flows.split s ON account.id = s.account_id\ 
  LEFT JOIN cash_flows.user a ON account.paid_user_id = a.id\ 
  LEFT JOIN cash_flows.user b ON s.user_id = b.id\
  LEFT JOIN cash_flows.tag ON account.tag_id = tag.id\
  WHERE account.id =?`;
  const bind = [accountId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getLastWeekTotal = async (bookId) => {
  const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, sum(amount) as total from cash_flows.account where book_id = ? and is_ignored=0 and DATE(date) > (NOW() - INTERVAL 5 DAY) group by date`;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthTagPie = async (bookId, startTime, endTime) => {
  const sql = `SELECT  tag.tag, sum(account.amount) as total FROM account INNER JOIN tag ON account.tag_id= tag.id WHERE book_id =? and is_ignored=0 and date between ? and ? group by tag_id`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthIncome = async (bookId, startTime, endTime) => {
  const sql = `SELECT paid_user_id as id, sum(amount) as income FROM cash_flows.account\
   where book_id =? and type_id=1 and date between ? and ? group by paid_user_id;`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthUnsplit = async (bookId, startTime, endTime) => {
  const sql = `SELECT paid_user_id as id, sum(amount) as expense FROM cash_flows.account\
   where book_id =? and split=0 and type_id=2 and date between ? and ? group by paid_user_id;`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthBalanced = async (bookId, startTime, endTime) => {
  const sql = `SELECT split.user_id as id, sum(split.split) as expense FROM cash_flows.split INNER JOIN cash_flows.account ON split.account_id = account.id where account.book_id =? and account.is_ignored =0 and split.is_calculated =1 and date between ? and ?  group by split.user_id;
  `;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthUnbalanced = async (bookId) => {
  const sql = `SELECT user.id, sum(split.balance+split.current_balance) as balance FROM cash_flows.split INNER JOIN account ON split.account_id=account.id INNER JOIN user
  ON split.user_id=user.id  where account.book_id= ? and split.is_calculated =0 group by split.user_id ;
  `;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthsplitHalf = async (bookId, startTime, endTime) => {
  const sql = `SELECT split.user_id as id, sum(split.split-(split.balance+split.current_balance)*( 1 XOR split.is_calculated) ) as sum FROM cash_flows.split\
   INNER JOIN cash_flows.account ON split.account_id = account.id\
    where account.book_id= ? and account.is_ignored =0 and account.date between ? and ? \
    and split.account_id >= (SELECT min(split.account_id) as account FROM cash_flows.split \
    INNER JOIN cash_flows.account ON split.account_id = account.id where account.book_id= ? \
    and account.is_ignored =0 and split.is_calculated =0) group by split.user_id;`;
  const bind = [bookId, startTime, endTime, bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getWeekUnsplit = async (bookId) => {
  const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, paid_user_id, sum(amount) as unsplit FROM account where book_id =? and is_ignored=0 and split =0 and type_id =2 and DATE(date) > (NOW() - INTERVAL 5 DAY) group by date, paid_user_id;`;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getWeekBalanced = async (bookId) => {
  const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, split.user_id, sum(split.split) as balanced FROM cash_flows.account\
  INNER JOIN cash_flows.split ON account.id = split.account_id\
  where account.book_id = ? and account.is_ignored=0 and account.split =1 \
  and split.is_calculated = 1 and account.type_id =2 and DATE(account.date) > (NOW() - INTERVAL 5 DAY)\
  group by split.user_id, account.date;
  `;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getWeekUnbalanced = async (bookId) => {
  const sql = `SELECT date, split.user_id, sum(split.split-split.balance-split.current_balance) as unbalanced\
   FROM cash_flows.account INNER JOIN cash_flows.split ON account.id = split.account_id\
   where account.book_id = ? and account.is_ignored=0 and account.split =1\ 
   and split.is_calculated = 0 and account.type_id =2 and DATE(account.date) > (NOW() - INTERVAL 5 DAY)\
    group by split.user_id, account.date;`;
  const bind = [bookId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const deleteAccount = async (accountId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "DELETE FROM cash_flows.account WHERE id =?",
      [accountId]
    );
    await conn.query("DELETE FROM cash_flows.account WHERE account.id =?", [
      accountId,
    ]);
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

module.exports = {
  createAccount,
  getOverview,
  getAccountList,
  getAccountDetail,
  getLastWeekTotal,
  getMonthTagPie,
  getMonthIncome,
  getMonthUnsplit,
  getMonthBalanced,
  getMonthUnbalanced,
  getMonthsplitHalf,
  getWeekUnsplit,
  getWeekBalanced,
  getWeekUnbalanced,
  deleteAccount,
};
