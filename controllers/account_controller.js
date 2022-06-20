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
    paymethod,
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
      let splits = [];
      let balance = [];
      if (paymethod === "equally") {
        splits = memberIds.map(
          (item) =>
            +Number.parseFloat(parseInt(amount) / memberIds.length).toFixed(2)
        );
        balance = [...splits];
        const sum = splits.reduce(
          (previousValue, currentValue) =>
            previousValue + Number.parseFloat(currentValue),
          0
        );
        const idx = memberIds.findIndex((item) => item === parseInt(paidId));
        balance[idx] = (sum - splits[idx]) * -1;
      }
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
    const response = await Account.getAccountList(userId, bookId);
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
