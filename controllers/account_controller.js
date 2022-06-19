const Account = require("../models/account_model");
const _ = require("lodash");

const createAccount = async (req, res) => {
  const { bookId, userId, typeId, tagId, amount, date, split, note } = req.body;
  const data = {
    book_id: parseInt(bookId),
    user_id: parseInt(userId),
    type_id: parseInt(typeId),
    tag_id: parseInt(tagId),
    amount: parseInt(amount),
    date: date.slice(0, 10),
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

const getAccountList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookId = req.query.bookId;
    const response = await Account.getAccountList(userId, bookId);
    console.log(response);
    const lists = await _.groupBy(response, (r) => r.date);
    const dates = Object.keys(lists);
    let totals = [];
    dates.forEach((date) => {
      totalArr = lists[date].map((item) =>
        item.type_id === 0 ? item.amount : -1 * item.amount
      );
      let total = totalArr.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0
      );
      totals.push(total);
    });

    const accounts = [];
    for (let i = 0; i < dates.length; i++) {
      const details = lists[dates[i]].map((item) => {
        return {
          amount: item.type_id === 0 ? item.amount : -1 * item.amount,
          tag: item.tag,
          note: item.note,
        };
      });

      let data = {
        date: dates[i],
        total: totals[i],
        details: details,
      };
      accounts.push(data);
    }
    return res.status(200).send({ data: accounts });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createAccount,
  getAccountList,
};
