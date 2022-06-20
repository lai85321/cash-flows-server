const Balance = require("../models/balance_model");
const balance = require("../util/getBalance");
const getBalanceList = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const response = await Balance.getBalanceList(bookId);
    const userIds = response.map((item) => item.id);
    const users = response.map((item) => item.name);
    const amount = response.map((item) => item.balance);
    const split = balance(amount);
    let hash = {};
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
    });
    const data = userIds.map((item, index) => {
      return {
        userId: item,
        name: users[index],
        balance: hash[item],
      };
    });
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBalanceList,
};
