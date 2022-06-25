const Book = require("../models/book_model");
const Member = require("../models/member_model");


const createBook = async (req, res) => {
  try {
   
  } catch (err) {
    console.log(err);
  }
};

const getBookList = async (req, res) => {
  try {
    const userId = req.query.userId
    const result = await Book.getBookList(userId)
    return res.status(200).send({data:result})
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createBook,
  getBookList,
};
