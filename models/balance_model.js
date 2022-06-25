const sqlBind = require("../util/sqlBind");
const getBalanceList = async (userId, bookId) => {
  const sql = `SELECT convert_tz(account.date,'+00:00','+08:00') as date,b.id as user_id, a.NAME as user, b.NAME as paidUser, t.balance \
  FROM split t\
  JOIN user a ON t.user_id =a.id\
  JOIN user b ON t.paid_user_id = b.id\
  INNER JOIN account ON t.account_id = account.id\
  WHERE  (t.user_id!=t.paid_user_id and t.user_id= ? and account.book_id= ?) \
  OR (t.user_id!=t.paid_user_id and t.paid_user_id= ? and account.book_id= ?)\
  ORDER by date DESC`;
  const bind = [userId, bookId, userId, bookId];
  const result = await sqlBind(sql, bind);
  return result;
};
const getGroupBalanceList = async (bookId) => {
  const sql = `SELECT user.id, user.name, sum(split.balance) as balance FROM cash_flows.split INNER JOIN account ON split.account_id=account.id INNER JOIN user
  ON split.user_id=user.id  where account.book_id= ? group by split.user_id ;
  `;
  const bind = [bookId];
  const result = await sqlBind(sql, bind);
  return result;
};

module.exports = {
  getBalanceList,
  getGroupBalanceList,
};
