const Account = require("../models/account_model");
const Split = require("../models/split_model");
const balance = require("../util/getBalance");
const _ = require("lodash");

const getBalanceList = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const balances = await Split.getBalanceList(bookId);
    let details = [];
    let splitIds = [];
    let dates = [];
    for (let i = 0; i < balances.length; i++) {
      balances[i].date.setHours(balances[i].date.getHours() + 8);
      dates.push(balances[i].date.toString().slice(0, 15));
      splitIds.push(parseInt(balances[i].splitId));
      details.push(
        `${balances[i].user} owes ${balances[i].paidUser} $${balances[i].balance}`
      );
    }
    const balanceMaps = await _.groupBy(balances, (b) => {
      return b.date.toString().slice(0, 15);
    });
    const dateKeys = Object.keys(balanceMaps);
    let data = [];
    let hash = {};
    //init response data and hash map
    for (let i = 0; i < dateKeys.length; i++) {
      data.push({ date: dateKeys[i], details: [] });
      hash[dateKeys[i]] = i;
    }
    //insert details into data
    for (let i = 0; i < dates.length; i++) {
      const hashIdx = hash[dates[i]];
      data[hashIdx].details.push({
        splitId: splitIds[i],
        detail: details[i],
      });
    }
    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

const getGroupBalanceList = async (req, res) => {
  try {
    const now = new Date();
    const utcDate = new Date(now.toUTCString().slice(0, -4));
    const bookId = parseInt(req.query.bookId);
    const userId = req.query.userId;
    const response = await Split.getGroupBalanceList(bookId);
    const userIds = response.map((item) => parseInt(item.id));
    const users = response.map((item) => item.name);
    const amount = response.map((item) => parseInt(item.balance));
    const split = await balance(amount);
    const splitAmount = split.map((item) => item[2]);
    const accountData = splitAmount.map((item) => {
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
    const splitOweData = split.map((item, idx) => {
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
    const splitLendData = split.map((item, idx) => {
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
    splitData = [...splitOweData, ...splitLendData];
    const splitId = await Split.createBalancedSplit(bookId, splitData);
    await Split.updateSplitIsCalculated(splitId, bookId);
    const details = [];
    split.forEach((item, idx) => {
      let oweName = users[item[0]];
      let lendName = users[item[1]];
      details.push(`${oweName} owes ${lendName} $${item[2]}`);
    });
    const responseData = details.map((item, idx) => {
      return {
        splitId: parseInt(splitId) + idx,
        detail: item,
      };
    });
    const data = [
      {
        date: utcDate.toString(),
        details: responseData,
      },
    ];
    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

const updateSplitStatus = async (req, res) => {
  try {
    const { bookId, userId, splitId } = req.query;
    const now = new Date();
    const utcDate = new Date(now.toUTCString().slice(0, -4));
    await Split.updateSettleStatus(
      parseInt(bookId),
      parseInt(userId),
      parseInt(splitId),
      utcDate
    );
    const balances = await Split.getBalanceList(bookId);
    let details = [];
    let splitIds = [];
    let dates = [];
    for (let i = 0; i < balances.length; i++) {
      dates.push(balances[i].date.toString().slice(0, 15));
      splitIds.push(parseInt(balances[i].splitId));
      details.push(
        `${balances[i].user} owes ${balances[i].paidUser} $${balances[i].balance}`
      );
    }
    const balanceMaps = await _.groupBy(balances, (b) => b.date);
    const dateKeys = Object.keys(balanceMaps);
    let data = [];
    let hash = {};
    //init response data and hash map
    for (let i = 0; i < dateKeys.length; i++) {
      data.push({ date: dateKeys[i], details: [] });
      hash[dateKeys[i]] = i;
    }
    //insert details into data
    for (let i = 0; i < dates.length; i++) {
      const hashIdx = hash[dates[i]];
      data[hashIdx].details.push({
        splitId: splitIds[i],
        detail: details[i],
      });
    }
    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBalanceList,
  getGroupBalanceList,
  updateSplitStatus,
};
