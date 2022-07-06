const pool = require("../database");
const createBook = async (book) => {
  const result = await pool.query(`INSERT INTO book SET ?`, [book]);
  return result.insertId;
};

const getBookList = async (userId) => {
  const sql = `SELECT book.id, book.name, book.image FROM book INNER JOIN member ON book.id=member.book_id WHERE member.user_id=?;`;
  const bind = [userId];
  const [result] = await pool.query(sql, bind);
  return result;
};
module.exports = {
  createBook,
  getBookList,
};
