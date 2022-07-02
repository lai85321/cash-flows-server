const sqlBind = require("../util/sqlBind");
const pool = require("../database");
const createMember = async (member) => {
  //const result = await sqlBind(`INSERT INTO member SET ?`, member);
  const result = await pool.query(`INSERT INTO member SET ?`, [member]);
  return result.insertId;
};

const AddMember = async (bookId, email) => {
  const sql = `INSERT INTO cash_flows.member (book_id, user_id)\
  VALUES (?,(SELECT id FROM  cash_flows.user WHERE email=?));`;
  const bind = [bookId, email];
  //const result = await sqlBind(sql, bind);
  const [result] = await pool.query(sql, bind);

  return result.insertId;
};

const getMemberList = async (bookId) => {
  const [result] = await pool.query(
    `SELECT user.id, user.name, user.picture FROM member INNER JOIN user ON member.user_id=user.id WHERE member.book_id = ?`,
    [bookId]
  );
  return result;
};

const deleteMember = async (bookId, userId) => {
  const [result] = await pool.query(
    `Delete from member where book_id = ? and user_id = ?;`,
    [bookId, userId]
  );
  return result;
};

module.exports = {
  createMember,
  AddMember,
  getMemberList,
  deleteMember,
};
