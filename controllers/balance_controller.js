const Account = require("../models/account_model");
const Balance = require("../models/balance_model");
const Split = require("../models/split_model");
const balance = require("../util/getBalance");
const _ = require("lodash");
const getBalanceList = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const response = await Balance.getBalanceList(bookId);
    let details = [];
    let splitIds = [];
    let dates = [];
    for (let i = 0; i < response.length; i++) {
      response[i].date.setHours(response[i].date.getHours() + 8);
      dates.push(response[i].date.toString().slice(0, 15));
      splitIds.push(parseInt(response[i].splitId));
      details.push(
        `${response[i].user} owes ${response[i].paidUser} $${response[i].balance}`
      );
    }
    const result = await _.groupBy(response, (r) => {
      return r.date.toString().slice(0, 15);
    });
    let datesKey = Object.keys(result);
    datesArr = datesKey.map((item) => item.slice(0, 15));
    let data = [];
    for (let i = 0; i < dates.length; i++) {
      const idx = datesArr.findIndex((item) => item === dates[i]);
      if (!data[idx]) {
        data[idx] = {
          date: dates[i],
          details: [
            {
              splitId: splitIds[i],
              detail: details[i],
            },
          ],
        };
      } else {
        data[idx].splitId;
        data[idx].details.push({
          splitId: splitIds[i],
          detail: details[i],
        });
      }
    }
    return res.status(200).send({ data: data });
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
    const response = await Balance.getGroupBalanceList(bookId);
    const userIds = response.map((item) => item.id);
    const users = response.map((item) => item.name);
    const amount = response.map((item) => parseInt(item.balance));
    const split = balance(amount);
    const details = [];
    split.forEach((item, idx) => {
      let oweName = users[item[0]];
      let lendName = users[item[1]];
      details.push(`${oweName} owes ${lendName} $${item[2]}`);
    });

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
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

const updateSplitStatus = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const userId = req.query.userId;
    const splitId = req.query.splitId;
    const now = new Date();
    const utcDate = new Date(now.toUTCString().slice(0, -4));
    await Split.settleSplitStatus(
      parseInt(bookId),
      parseInt(userId),
      parseInt(splitId),
      utcDate
    );
    const response = await Balance.getBalanceList(bookId);
    let details = [];
    let splitIds = [];
    let dates = [];
    for (let i = 0; i < response.length; i++) {
      dates.push(response[i].date.toString().slice(0, 15));
      splitIds.push(parseInt(response[i].splitId));
      details.push(
        `${response[i].user} owes ${response[i].paidUser} $${response[i].balance}`
      );
    }
    const result = await _.groupBy(response, (r) => r.date);
    let datesKey = Object.keys(result);
    datesArr = datesKey.map((item) => item.slice(0, 15));
    let data = [];
    for (let i = 0; i < dates.length; i++) {
      const idx = datesArr.findIndex((item) => item === dates[i]);
      if (!data[idx]) {
        data[idx] = {
          date: dates[i],
          details: [
            {
              splitId: splitIds[i],
              detail: details[i],
            },
          ],
        };
      } else {
        data[idx].details.push({
          splitId: splitIds[i],
          detail: details[i],
        });
      }
    }
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBalanceList,
  getGroupBalanceList,
  updateSplitStatus,
};
