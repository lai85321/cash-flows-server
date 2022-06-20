const sqlBind = require("../util/sqlBind");

const getMemberList = async (bookId) => {
  const result = await sqlBind(
    `SELECT user.id, user.name FROM member INNER JOIN user ON member.user_id=user.id WHERE member.book_id = ?`,
    bookId
  );
  return result;
};

module.exports = {
  getMemberList,
};
