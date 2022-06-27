const sqlBind = require("../util/sqlBind");

const createSplit = async (splitData) => {
  const result = await sqlBind(
    `INSERT INTO split (account_id, user_id, paid_user_id, split, balance,status) VALUES ?`,
    [splitData]
  );
  return result.insertId;
};

module.exports = {
  createSplit,
};
