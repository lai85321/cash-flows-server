const pool = require("../database");
const createBook = async (book) => {
  const [result] = await pool.query(
    `INSERT INTO book (name, currency_id) VALUES ?`,
    [book]
  );
  return result.insertId;
};

const getBookList = async (userId) => {
  const sql = `SELECT book.id, book.name, book.image FROM book INNER JOIN member ON book.id=member.book_id WHERE member.user_id=? order by member.openTime DESC;`;
  const bind = [userId];
  const [result] = await pool.query(sql, bind);
  return result;
};

const updateBudget = async (updateData, bookId) => {
  const [result] = await pool.query("UPDATE book SET ? WHERE id=?", [
    updateData,
    bookId,
  ]);
  return result;
};

module.exports = {
  createBook,
  getBookList,
  updateBudget,
};
