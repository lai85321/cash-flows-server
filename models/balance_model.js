const sqlBind = require("../util/sqlBind");

const getBalanceList = async (bookId) => {
  const sql = `SELECT user.id, user.name, sum(split.balance) as balance FROM cash_flows.split INNER JOIN account ON split.account_id=account.id INNER JOIN user
  ON split.user_id=user.id  where account.book_id= ? group by split.user_id ;
  `;
  const bind = [bookId];
  const result = await sqlBind(sql, bind);
  return result;
};

module.exports = {
  getBalanceList,
};
