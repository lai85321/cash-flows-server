const Account = require("../models/account_model");
const Member = require("../models/member_model");
const Split = require("../models/split_model");
const getMonthRange = require("../util/getMonthRange");
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

  if (note.trim() === "") {
    return res.status(400).send({ error: "Please enter a valid note" });
  }

  const data = [
    [
      parseInt(bookId),
      parseInt(userId),
      parseInt(tagId),
      parseInt(typeId),
      parseInt(amount),
      date,
      split,
      note,
      0,
    ],
  ];

  try {
    const accountId = await Account.createAccount(data);
    if (split === 1) {
      const members = await Member.getMemberList(parseInt(bookId));
      const memberIds = members.map((item) => item.id);
      let balance = [...splits];
      const sum = splits.reduce(
        (previousValue, currentValue) =>
          previousValue + Number.parseFloat(currentValue),
        0
      );
      const idx = memberIds.findIndex((item) => item === parseInt(paidId));
      balance[idx] = (sum - splits[idx]) * -1;
      let splitData = [];
      splits.forEach((item, idx) => {
        if (splits[idx] != 0) {
          splitData.push([
            accountId,
            memberIds[idx],
            parseInt(paidId),
            splits[idx],
            balance[idx],
            0,
            0,
            0,
            1,
          ]);
        }
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
    const bookId = req.query.bookId;
    const monthRange = getMonthRange(req.query.startTime);
    const overview = await Account.getOverview(
      bookId,
      monthRange.start,
      monthRange.end
    );
    const incomeExist = overview.find((item) => item.type_id == 1);
    const expenseExist = overview.find((item) => item.type_id == 2);
    let income = 0;
    let expense = 0;
    if (typeof incomeExist != "undefined") {
      income = parseInt(incomeExist.total);
    }
    if (typeof expenseExist != "undefined") {
      expense = -1 * parseInt(expenseExist.total);
    }
    const balance = income + expense;
    const response = await Account.getAccountList(
      bookId,
      monthRange.start,
      monthRange.end
    );
    const status = await Split.checkSplitStatus(
      bookId,
      monthRange.start,
      monthRange.end
    );
    const lists = await _.groupBy(response, (r) => {
      return r.date.toString().slice(0, 15);
    });
    const dates = Object.keys(lists);
    let totals = [];
    dates.forEach((date) => {
      totalWithSigns = lists[date].map((item) =>
        item.type_id == 1 ? item.amount : -1 * item.amount
      );
      let total = totalWithSigns.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0
      );
      totals.push(total);
    });

    const accounts = [];
    for (let i = 0; i < dates.length; i++) {
      const details = lists[dates[i]].map((item) => {
        let splitStatus = 2;
        let find = status.find((s) => s.id == item.id);
        if (typeof find != "undefined") {
          splitStatus = find.status;
        }
        return {
          id: item.id,
          name: item.name,
          status: splitStatus,
          amount: item.type_id !== 2 ? item.amount : -1 * item.amount,
          tag: item.tag,
          note: item.note,
        };
      });
      let accountData = {
        date: dates[i].slice(4, 10),
        total: totals[i],
        details: details,
      };
      accounts.push(accountData);
    }
    const data = {
      budget: response.length === 0 ? 0 : response[0].budget,
      income: income,
      expense: expense,
      balance: balance,
      daily: accounts,
    };

    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

const getAccountDetail = async (req, res) => {
  try {
    const accountId = req.query.id;
    const result = await Account.getAccountDetail(accountId);
    let data = {};
    const { amount, paid_name, note, tag } = result[0];
    let date = result[0].date;
    date = date.setHours(date.getHours() + 8);
    if (result[0].split === null) {
      data = {
        amount: amount,
        paidName: paid_name,
        note: note,
        tag: tag,
        date: date,
      };
    } else {
      const splits = result.map((item) => {
        return { splitName: item.split_name, split: item.split };
      });
      data = {
        amount: amount,
        paidName: paid_name,
        note: note,
        tag: tag,
        date: date,
        splits: splits,
      };
    }
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

const getMemberOverview = async (req, res) => {
  try {
    const bookId = parseInt(req.query.bookId);
    const monthRange = getMonthRange(req.query.startTime);
    const members = await Member.getMemberList(parseInt(bookId));
    const memberIds = members.map((item) => item.id);
    const overviews = await Account.getMemberOverview(
      parseInt(bookId),
      monthRange.start,
      monthRange.end
    );
    const overviewMaps = await _.groupBy(overviews, (o) => {
      return o.user_id;
    });
    const data = members.map((item, idx) => {
      let payment = 0;
      let userIdx = overviews.findIndex((o) => o.user_id == memberIds[idx]);
      if (userIdx != -1) {
        const userId = overviews[userIdx].user_id;
        const expenseId = overviewMaps[userId].findIndex(
          (o) => o.type_id === 2
        );
        if (expenseId != -1) {
          payment += -1 * parseInt(overviewMaps[userId][expenseId].amount);
        }
        const settleId = overviewMaps[userId].findIndex((o) => o.type_id === 3);
        if (settleId != -1) {
          payment += parseInt(overviewMaps[userId][settleId].amount);
        }
      }
      return {
        id: item.id,
        name: item.name,
        picture: item.picture,
        payment: payment,
      };
    });
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const removeId = parseInt(req.query.id);
    const result = await Account.getAccountDetail(removeId);
    if (result[0].is_calculated !== 1) {
      await Account.deleteAccount(removeId);
    }
    return res.status(200).send({ data: "Delete account" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createAccount,
  getAccountList,
  getAccountDetail,
  getMemberOverview,
  deleteAccount,
};
