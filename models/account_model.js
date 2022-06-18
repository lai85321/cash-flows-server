const sqlBind = require("../util/sqlBind");

const createAccount = async (account) => {
  const result = await sqlBind(`INSERT INTO account SET ?`, account);
  return result.insertId;
};

module.exports = {
  createAccount,
};
