const sqlBind = require("../util/sqlBind");

const createBook = async (book) => {
 
};

const getBookList = async (userId) => {
 const sql = `SELECT book.id, book.name, book.image FROM book INNER JOIN member ON book.id=member.book_id WHERE member.user_id=?;`
 const bind =[userId]
 const result = sqlBind(sql,bind)
 return result
};
module.exports = {
    createBook,
    getBookList
};
