const pool = require("../database");

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

module.exports = {
  getBalanceList,
  getGroupBalanceList,
};
