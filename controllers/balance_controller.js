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
    const date = new Date();
    const bookId = req.query.bookId;
    const userId = req.query.userId;
    const response = await Balance.getGroupBalanceList(bookId);
    const userIds = response.map((item) => item.id);
    const users = response.map((item) => item.name);
    const amount = response.map((item) => item.balance);
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
        parseInt(bookId),
        parseInt(userId),
        4,
        3,
        item,
        date,
        1,
        "group balance",
        1,
      ];
    });
    const accountId = await Account.createAccount(accountData);
    let splitData = split.map((item, idx) => {
      return [
        accountId + idx,
        parseInt(userIds[item[0]]),
        parseInt(userIds[item[1]]),
        parseInt(item[2]),
        parseInt(item[2]),
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
        0,
      ];
    });
    splitData = [...splitData, ...splitData1];
    const splitId = await Split.createSplit(splitData);
    const resultId = await Split.updateSplitStatus(splitId);

    const responseData = details.map((item, idx) => {
      return {
        splitId: parseInt(splitId) + idx,
        detail: item,
      };
    });
    const data = [
      {
        date: date.toString(),
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
    const splitId = req.query.splitId;
    await Split.settleSplitStatus(parseInt(splitId));
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

module.exports = {
  getBalanceList,
  getGroupBalanceList,
  updateSplitStatus,
};
