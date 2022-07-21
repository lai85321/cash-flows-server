const Book = require("../models/book_model");
const Member = require("../models/member_model");

const createBook = async (req, res) => {
  const { userId, name, currencyId } = req.body;
  if (name.trim() === "") {
    return res.status(400).send({ error: "Please enter a valid name" });
  }
  const bookData = [[name, parseInt(currencyId)]];
  try {
    const bookId = await Book.createBook(bookData);
    const memberData = {
      user_id: userId,
      book_id: bookId,
      openTIme: new Date(),
    };
    await Member.createMember(memberData);
    return res.status(200).send({ data: { bookId } });
  } catch (err) {
    console.log(err);
  }
};

const getBookList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const data = await Book.getBookList(userId);
    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

const updateBudget = async (req, res) => {
  try {
    const bookId = req.query.id;
    const updateData = req.body;
    const result = await Book.updateBudget(updateData, bookId);
    return res.status(200).send({ data: result[0] });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createBook,
  getBookList,
  updateBudget,
};
