const Member = require("../models/member_model");
const Book = require("../models/book_model");
const addMember = async (req, res) => {
  try {
    const { bookId, email } = req.body;
    const resultId = await Member.AddMember(bookId, email);
    const result = await Member.getMemberList(bookId);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
  }
};

const getMemberList = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const result = await Member.getMemberList(bookId);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
  }
};

const deleteMember = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const userId = req.query.userId;
    await Member.deleteMember(bookId, userId);
    const result = await Book.getBookList(userId);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addMember,
  getMemberList,
  deleteMember,
};
