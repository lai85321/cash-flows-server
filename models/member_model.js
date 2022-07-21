const pool = require("../database");
const createMember = async (member) => {
  const result = await pool.query(`INSERT INTO member SET ?`, [member]);
  return result.insertId;
};

const addMember = async (bookId, email) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [userId] = await conn.query("SELECT id FROM user WHERE email=?", [
      email,
    ]);
    if (userId.length === 0) {
      return {
        error: "Email Invalid",
        status: 422,
      };
    }
    const sql = `INSERT INTO cash_flows.member (book_id, user_id) VALUES (?,?);`;
    const bind = [bookId, userId[0].id];
    const [result] = await conn.query(sql, bind);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return {
      error: "User Already Exists",
      status: 403,
    };
  } finally {
    await conn.release();
  }
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

const updateOpenTime = async (openTime, userId, bookId) => {
  const [result] = await pool.query(
    `Update member SET member.openTime = ? where book_id = ? and user_id = ?;`,
    [openTime, bookId, userId]
  );
  return result;
};

module.exports = {
  createMember,
  addMember,
  getMemberList,
  deleteMember,
  updateOpenTime,
};
