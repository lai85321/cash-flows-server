const Member = require("../models/member_model");
const Book = require("../models/book_model");
const addMember = async (req, res) => {
  try {
    const { bookId, email } = req.body;
    const result = await Member.addMember(bookId, email);
    const memberData = await Member.getMemberList(bookId);
    if (result.error) {
      return res
        .status(result.status)
        .send({ error: result.error, data: memberData });
    }
    return res.status(200).send({ data: memberData });
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

const updateOpenTime = async (req, res) => {
  try {
    const openTime = new Date();
    const bookId = req.query.bookId;
    const userId = req.query.userId;
    await Member.updateOpenTime(openTime, bookId, userId);
    return res.status(200).send({ data: "update openTime" });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  addMember,
  getMemberList,
  deleteMember,
  updateOpenTime,
};
