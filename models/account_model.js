const sqlBind = require("../util/sqlBind");

const createAccount = async (account) => {
  const result = await sqlBind(`INSERT INTO account SET ?`, account);
  return result.insertId;
};

const getOverview = async (userId, bookId, startTime, endTime) => {
  const sql = `SELECT type_id, sum(amount) as total FROM account WHERE user_id = ? and book_id =? and date between ? and ? group by type_id`;
  const bind = [userId, bookId, startTime, endTime];
  const result = await sqlBind(sql, bind);
  return result;
};

const getAccountList = async (userId, bookId, startTime, endTime) => {
  const sql = `SELECT account.*, tag.tag FROM account INNER JOIN tag ON account.tag_id=tag.id WHERE account.user_id = ? and account.book_id =? and date between ? and ? order by account.date DESC`;
  const bind = [userId, bookId, startTime, endTime];
  const result = await sqlBind(sql, bind);
  return result;
};

const getLastWeekTotal = async (bookId, date) => {
  const sql = `SELECT convert_tz(date,'+00:00','+08:00') as date, sum(amount) as total from cash_flows.account where book_id = ? && TO_DAYS(NOW()) - TO_DAYS(date) < 4 group by date;
  `;
  const bind = [bookId, date];
  const result = await sqlBind(sql, bind);
  return result;
};

module.exports = {
  createAccount,
  getOverview,
  getAccountList,
  getLastWeekTotal,
};
