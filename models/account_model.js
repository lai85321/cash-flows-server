const sqlBind = require("../util/sqlBind");

const createAccount = async (account) => {
  const result = await sqlBind(
    `INSERT INTO account (book_id, paid_user_id, tag_id, type_id, amount, date, split, note, is_ignored) VALUES ?`,
    [account]
  );
  return result.insertId;
};

const getOverview = async (bookId, startTime, endTime) => {
  const sql = `SELECT type_id, sum(amount) as total FROM account WHERE book_id =? and is_ignored=0 and date between ? and ? group by type_id`;
  const bind = [bookId, startTime, endTime];
  const result = await sqlBind(sql, bind);
  return result;
};

const getAccountList = async (bookId, startTime, endTime) => {
  const sql = `SELECT account.*, tag.tag FROM account INNER JOIN tag ON account.tag_id=tag.id WHERE  account.book_id =? and is_ignored=0 and date between ? and ? order by account.date DESC`;
  const bind = [bookId, startTime, endTime];
  const result = await sqlBind(sql, bind);
  return result;
};

const getLastWeekTotal = async (bookId) => {
  // const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, sum(amount) as total from cash_flows.account where book_id = ? && TO_DAYS(NOW()) - TO_DAYS(date) < 4 group by date;
  // `;
  const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, sum(amount) as total from cash_flows.account where book_id = ? and is_ignored=0 and DATE(date) > (NOW() - INTERVAL 5 DAY) group by date`;
  const bind = [bookId];
  const result = await sqlBind(sql, bind);
  return result;
};

const getMonthTagPie = async (bookId, startTime, endTime) => {
  const sql = `SELECT  tag.tag, sum(account.amount) as total FROM account INNER JOIN tag ON account.tag_id= tag.id WHERE book_id =? and is_ignored=0 and date between ? and ? group by tag_id`;
  const bind = [bookId, startTime, endTime];
  const result = await sqlBind(sql, bind);
  return result;
};

module.exports = {
  createAccount,
  getOverview,
  getAccountList,
  getLastWeekTotal,
  getMonthTagPie,
};
