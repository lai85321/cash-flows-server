const Account = require("../models/account_model");
const Member = require("../models/member_model");
const Split = require("../models/split_model");
const _ = require("lodash");

const createAccount = async (req, res) => {
  const {
    bookId,
    userId,
    typeId,
    tagId,
    amount,
    date,
    split,
    note,
    paidId,
    splits,
  } = req.body;
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
    const accountId = await Account.createAccount(data);
    if (split === 1) {
      const members = await Member.getMemberList(parseInt(bookId));
      const memberIds = members.map((item) => item.id);

      let balance = [];
      balance = [...splits];
      const sum = splits.reduce(
        (previousValue, currentValue) =>
          previousValue + Number.parseFloat(currentValue),
        0
      );
      const idx = memberIds.findIndex((item) => item === parseInt(paidId));
      balance[idx] = (sum - splits[idx]) * -1;

      const splitData = splits.map((item, idx) => {
        return [accountId, memberIds[idx], splits[idx], balance[idx]];
      });
      await Split.createSplit(splitData);
    }

    return res.status(200).send({ message: `add new account` });
  } catch (err) {
    console.log(err);
  }
};

const getAccountList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookId = req.query.bookId;
    let startTime = new Date(req.query.startTime);
    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    startTime = startTime.toJSON().slice(0, 10);
    endTime = endTime.toJSON().slice(0, 10);
    const overview = await Account.getOverview(
      userId,
      bookId,
      startTime,
      endTime
    );
    const income = overview[0].total;
    let expense = overview[1].total;
    expense = -1 * expense;
    const balance = income + expense;
    const response = await Account.getAccountList(
      userId,
      bookId,
      startTime,
      endTime
    );
    const lists = await _.groupBy(response, (r) => r.date);
    const dates = Object.keys(lists);
    let totals = [];
    dates.forEach((date) => {
      totalArr = lists[date].map((item) =>
        item.type_id === 1 ? item.amount : -1 * item.amount
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
          amount: item.type_id === 1 ? item.amount : -1 * item.amount,
          tag: item.tag,
          note: item.note,
        };
      });

      let data = {
        date: dates[i].slice(4, 10),
        total: totals[i],
        details: details,
      };
      accounts.push(data);
    }
    const dataObj = {
      income: income,
      expense: expense,
      balance: balance,
      daily: accounts,
    };
    return res.status(200).send({ data: dataObj });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createAccount,
  getAccountList,
};
