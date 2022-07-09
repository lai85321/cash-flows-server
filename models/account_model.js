const { end } = require("../database");
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
  const sql = `SELECT account.id, account.book_id, account.paid_user_id, account.tag_id, account.type_id, account.amount, convert_tz(account.date,'+00:00','+08:00') as date, account.split, account.note, account.is_ignored, tag.tag,user.name FROM cash_flows.account
  INNER JOIN cash_flows.tag ON account.tag_id=tag.id
  INNER JOIN cash_flows.user ON account.paid_user_id=user.id
  WHERE account.book_id = ? and is_ignored=0 and date >= ? and date < ?
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
  const sql = `SELECT  tag.tag, sum(account.amount) as total FROM account INNER JOIN tag ON account.tag_id= tag.id WHERE book_id =? and tag_id != 4 and is_ignored=0 and date between ? and ? group by tag_id`;
  const bind = [bookId, startTime, endTime];
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

const getMemberOverview = async (bookId, startTime, endTime) => {
  const sql = `SELECT user.name, account.paid_user_id as user_id, account.type_id,sum(account.amount) as amount FROM cash_flows.account\
  INNER JOIN cash_flows.user ON account.paid_user_id = user.id\
  WHERE account.book_id = ? and date >= ? and date < ? and is_ignored = 0\
  group by paid_user_id, account.type_id;`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

const getMonthOverview = async (bookId, startTime, endTime) => {
  const sql = `SELECT DATE(convert_tz(account.date,'+00:00','+08:00')) as date, sum(account.amount) as amount FROM cash_flows.account
  INNER JOIN cash_flows.user ON account.paid_user_id = user.id
  WHERE account.book_id = ? and account.date >= ? and account.date < ?  and is_ignored = 0 and tag_id!=4 and type_id =2
  group by DATE(convert_tz(account.date,'+00:00','+08:00')) order by DATE(convert_tz(account.date,'+00:00','+08:00'))`;
  const bind = [bookId, startTime, endTime];
  const [result] = await pool.query(sql, bind);
  return result;
};

module.exports = {
  createAccount,
  getOverview,
  getAccountList,
  getAccountDetail,
  getLastWeekTotal,
  getMonthTagPie,
  deleteAccount,
  getMemberOverview,
  getMonthOverview,
};
