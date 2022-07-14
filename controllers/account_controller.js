const Account = require("../models/account_model");
const Member = require("../models/member_model");
const Balance = require("../models/balance_model");
const Split = require("../models/split_model");
const balance = require("../util/getBalance");
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
      let balance = [];
      balance = [...splits];
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
    let startTime = new Date(parseInt(req.query.startTime));
    let endTime = new Date(parseInt(req.query.startTime));
    endTime.setMonth(startTime.getMonth() + 1);
    const utcStart = new Date(startTime.toUTCString().slice(0, -4));
    const utcEnd = new Date(endTime.toUTCString().slice(0, -4));
    const overview = await Account.getOverview(bookId, utcStart, utcEnd);
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
    const response = await Account.getAccountList(bookId, utcStart, utcEnd);
    const status = await Split.checkSplitStatus(bookId, utcStart, utcEnd);
    const lists = await _.groupBy(response, (r) => {
      return r.date.toString().slice(0, 15);
    });
    const dates = Object.keys(lists);
    let totals = [];
    dates.forEach((date) => {
      totalArr = lists[date].map((item) =>
        item.type_id == 1 ? item.amount : -1 * item.amount
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
      let data = {
        date: dates[i].slice(4, 10),
        total: totals[i],
        details: details,
      };
      accounts.push(data);
    }
    const dataObj = {
      budget: response[0].budget,
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

const getAccountDetail = async (req, res) => {
  try {
    const accountId = req.query.id;
    const result = await Account.getAccountDetail(accountId);
    let data = {};
    if (result[0].split === null) {
      const { amount, paid_name, note, tag, date } = result[0];
      data = {
        amount: amount,
        paidName: paid_name,
        note: note,
        tag: tag,
        date: date.setHours(date.getHours() + 8),
      };
    } else {
      const splits = result.map((item) => {
        return { splitName: item.split_name, split: item.split };
      });
      const { amount, paid_name, note, tag, date } = result[0];
      data = {
        amount: amount,
        paidName: paid_name,
        note: note,
        tag: tag,
        date: date.setHours(date.getHours() + 8),
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
    let startTime = new Date(parseInt(req.query.startTime));
    let endTime = new Date(parseInt(req.query.startTime));
    endTime.setMonth(startTime.getMonth() + 1);
    const utcStart = new Date(startTime.toUTCString().slice(0, -4));
    const utcEnd = new Date(endTime.toUTCString().slice(0, -4));
    const members = await Member.getMemberList(parseInt(bookId));
    const memberIds = members.map((item) => item.id);
    const overviews = await Account.getMemberOverview(
      parseInt(bookId),
      utcStart,
      utcEnd
    );
    const overviewsMap = await _.groupBy(overviews, (o) => {
      return o.user_id;
    });
    const data = members.map((item, idx) => {
      let payment = 0;
      let userIdx = overviews.findIndex((o) => o.user_id == memberIds[idx]);
      if (userIdx != -1) {
        let userId = overviews[userIdx].user_id;
        let expenseId = overviewsMap[userId].findIndex((o) => o.type_id === 2);
        if (expenseId != -1) {
          payment += -1 * parseInt(overviewsMap[userId][expenseId].amount);
        }
        let settleId = overviewsMap[userId].findIndex((o) => o.type_id === 3);
        if (settleId != -1) {
          payment += parseInt(overviewsMap[userId][settleId].amount);
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
    if (result[0].is_calculated == 1) {
      let recalUserIds = [];
      let recalBalance = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].status === 0) {
          recalUserIds.push(result[i].user_id);
          recalBalance.push(result[i].balance);
        }
      }
      const bookId = parseInt(req.query.bookId);
      const userId = parseInt(req.query.userId);
      const response = await Balance.getGroupBalanceList(bookId);
      const userIds = response.map((item) => item.id);
      const users = response.map((item) => item.name);
      const amount = response.map((item) => parseInt(item.balance));
      let newAmount = [];
      for (let i = 0; i < amount.length; i++) {
        let id = recalUserIds.findIndex((item) => item === userIds[i]);
        amount[i] = amount[i] + recalBalance[id];
      }
      const split = balance(amount);
      const details = [];
      split.forEach((item, idx) => {
        let oweName = users[item[0]];
        let lendName = users[item[1]];
        details.push(`${oweName} owes ${lendName} $${item[2]}`);
      });
      const now = new Date();
      const utcDate = new Date(now.toUTCString().slice(0, -4));
      const splitAmount = split.map((item, idx) => item[2]);
      const accountData = splitAmount.map((item, idx) => {
        return [
          bookId,
          parseInt(userId),
          4,
          3,
          item,
          utcDate,
          1,
          "group balance",
          1,
        ];
      });
      const accountId = await Account.createAccount(accountData);
      const historyId = await Split.getBalanceRange(bookId);
      let splitData = split.map((item, idx) => {
        return [
          accountId + idx,
          parseInt(userIds[item[0]]),
          parseInt(userIds[item[1]]),
          parseInt(item[2]),
          parseInt(item[2]),
          0,
          historyId[0].min,
          historyId[0].max,
          0,
          0,
          0,
        ];
      });
      const splitData1 = split.map((item, idx) => {
        return [
          accountId + idx,
          parseInt(userIds[item[1]]),
          parseInt(userIds[item[1]]),
          0,
          parseInt(item[2]) * -1,
          0,
          historyId[0].min,
          historyId[0].max,
          0,
          0,
          0,
        ];
      });
      splitData = [...splitData, ...splitData1];
      await Split.updateSplitStatus(bookId);
      const splitId = await Split.createBalancedSplit(splitData);
      const resultId = await Split.updateSplitIsCalculated(splitId);
      await Account.deleteAccount(removeId);
    } else {
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
