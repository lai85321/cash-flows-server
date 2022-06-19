const sqlBind = require("../util/sqlBind");

const createAccount = async (account) => {
  const result = await sqlBind(`INSERT INTO account SET ?`, account);
  return result.insertId;
};

const getAccountList = async (userId, bookId) => {
  const sql = `SELECT account.*, tag.tag FROM account INNER JOIN tag ON account.tag_id=tag.id WHERE account.user_id = ? and account.book_id =?  order by account.date DESC `;
  const bind = [userId, bookId];
  const result = await sqlBind(sql, bind);
  return result;
};

module.exports = {
  createAccount,
  getAccountList,
};
