const Account = require("../models/account_model");

const createAccount = async (req, res) => {
  const { bookId, userId, typeId, tagId, amount, date, split, note } = req.body;
  const data = {
    book_id: parseInt(bookId),
    user_id: parseInt(userId),
    type_id: parseInt(typeId),
    tag_id: parseInt(tagId),
    amount: parseInt(amount),
    date: date,
    split: split,
    split_status: 0,
    note: note,
  };
  try {
    await Account.createAccount(data);
    return res.status(200).send({ message: `add new account` });
  } catch (err) {
    console.log(err);
  }
};

const getAccountList = async (req, res) => {};

module.exports = {
  createAccount,
  getAccountList,
};
