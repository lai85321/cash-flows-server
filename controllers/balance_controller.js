const Balance = require("../models/balance_model");
const balance = require("../util/getBalance");
const _ = require("lodash");
const getBalanceList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookId = req.query.bookId;
    const response = await Balance.getBalanceList(userId, bookId);
    let details = [];
    let dates = [];
    for (let i = 0; i < response.length; i++) {
      dates.push(response[i].date.toString());
      if (response[i].user_id === parseInt(userId)) {
        details.push(`You lend ${response[i].user} $${response[i].balance}`);
      } else {
        details.push(`You owe ${response[i].paidUser} $${response[i].balance}`);
      }
    }
    const result = await _.groupBy(response, (r) => r.date);
    const datesArr = Object.keys(result);
    let data = [];
    for (let i = 0; i < dates.length; i++) {
      const idx = datesArr.findIndex((item) => item === dates[i]);
      if (!data[idx]) {
        data[idx] = {
          date: dates[i],
          details: [details[i]],
        };
      } else {
        data[idx].details.push(details[i]);
      }
    }
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};
const getGroupBalanceList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookId = req.query.bookId;
    const response = await Balance.getGroupBalanceList(bookId);
    const userIds = response.map((item) => item.id);
    const users = response.map((item) => item.name);
    const amount = response.map((item) => item.balance);
    const split = balance(amount);
    const userIdx = userIds.findIndex((item) => item === parseInt(userId));
    let hash = {};
    let userBalance = [];
    split.forEach((item, index) => {
      let oweId = userIds[item[0]];
      let lendId = userIds[item[1]];
      let oweName = users[item[0]];
      let lendName = users[item[1]];
      let amount = item[2];
      let oweDetail = `${oweName} owes ${lendName} ${amount}`;
      let lendDetail = `${lendName} lends ${oweName} ${amount}`;
      if (!hash[oweId]) {
        hash[oweId] = { amount: amount, details: [oweDetail] };
      } else {
        hash[oweId].amount += amount;
        hash[oweId].details.push(oweDetail);
      }
      if (!hash[lendId]) {
        hash[lendId] = { amount: amount, details: [lendDetail] };
      } else {
        hash[lendId].amount += amount;
        hash[lendId].details.push(lendDetail);
      }
      if (oweId === userIds[userIdx]) {
        userBalance.push(`Owe ${lendName} ${amount}`);
      }
      if (lendId === userIds[userIdx]) {
        userBalance.push(`Get back from ${oweName} ${amount}`);
      }
    });
    const data = userIds.map((item, index) => {
      return {
        userId: item,
        name: users[index],
        balance: hash[item],
      };
    });
    return res
      .status(200)
      .send({ data: { groupBalance: data, userBalance: userBalance } });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBalanceList,
  getGroupBalanceList,
};
