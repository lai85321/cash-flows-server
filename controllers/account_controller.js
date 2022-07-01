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
  const data = [
    [
      parseInt(bookId),
      parseInt(userId),
      parseInt(tagId),
      parseInt(typeId),
      parseInt(amount),
      date.slice(0, 10),
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

      const splitData = splits.map((item, idx) => {
        return [
          accountId,
          memberIds[idx],
          parseInt(paidId),
          splits[idx],
          balance[idx],
          0,
          0,
          0,
          1,
        ];
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
    let startTime = new Date(req.query.startTime);
    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    startTime = startTime.toJSON().slice(0, 10);
    endTime = endTime.toJSON().slice(0, 10);
    const overview = await Account.getOverview(bookId, startTime, endTime);
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
    const response = await Account.getAccountList(bookId, startTime, endTime);
    const status = await Split.checkSplitStatus(bookId, startTime, endTime);
    const lists = await _.groupBy(response, (r) =>
      r.date.toString().slice(0, 15)
    );
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
        let splitStatus = 2;
        let find = status.find((s) => s.id == item.id);
        if (typeof find != "undefined") {
          splitStatus = find.status;
        }
        return {
          id: item.id,
          name: item.name,
          status: splitStatus,
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

const getMemberOverview = async (req, res) => {
  try {
    const bookId = parseInt(req.query.bookId);
    let startTime = new Date(req.query.startTime);

    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    startTime = startTime.toJSON().slice(0, 10);
    endTime = endTime.toJSON().slice(0, 10);
    const incomeResult = await Account.getMonthIncome(
      bookId,
      startTime,
      endTime
    );

    const incomeMap = await _.groupBy(incomeResult, (r) => r.id);
    const unsplitResult = await Account.getMonthUnsplit(
      bookId,
      startTime,
      endTime
    );
    const unsplits = await _.groupBy(unsplitResult, (r) => r.id);
    const balancedResult = await Account.getMonthBalanced(
      bookId,
      startTime,
      endTime
    );
    const balanceds = await _.groupBy(balancedResult, (r) => r.id);
    const unbalancedResult = await Account.getMonthUnbalanced(
      bookId,
      startTime,
      endTime
    );
    const unbalanceds = await _.groupBy(unbalancedResult, (r) => r.id);
    const splitHalfResult = await Account.getMonthsplitHalf(
      bookId,
      startTime,
      endTime
    );

    const splitHalfs = await _.groupBy(splitHalfResult, (r) => r.id);
    const members = await Member.getMemberList(parseInt(bookId));
    const memberIds = members.map((item) => item.id);
    let incomes = [];
    let expenses = [];
    const results = memberIds.map((item) => {
      let income = incomeMap[item] ? parseInt(incomeMap[item][0].income) : 0;
      let unsplit = unsplits[item] ? parseInt(unsplits[item][0].expense) : 0;
      let unbalanced = unbalanceds[item]
        ? parseInt(unbalanceds[item][0].balance)
        : 0;
      let balanced = balanceds[item] ? parseInt(balanceds[item][0].expense) : 0;
      let splitHalf = splitHalfs[item] ? parseInt(splitHalfs[item][0].sum) : 0;
      incomes.push(income);
      expenses.push(unsplit + balanced - unbalanced + splitHalf);
    });

    const data = members.map((item, idx) => {
      return {
        id: item.id,
        name: item.name,
        income: incomes[idx],
        expense: expenses[idx],
      };
    });
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createAccount,
  getAccountList,
  getMemberOverview,
};
