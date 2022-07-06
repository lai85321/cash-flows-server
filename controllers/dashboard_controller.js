const Account = require("../models/account_model");
const Member = require("../models/member_model");
const _ = require("lodash");

const getSingleDailyChart = async (req, res) => {
  const bookId = req.query.bookId;
  const datesDesc = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toJSON().slice(5, 10);
  });
  const dates = datesDesc.reverse();

  try {
    const dailyData = await Account.getLastWeekTotal(bookId);
    for (let i = 0; i < dailyData.length; i++) {
      dailyData[i].date = dailyData[i].date.toJSON().slice(5, 10);
    }
    const dailyObj = await _.groupBy(dailyData, (r) => r.date);
    let totals = [];
    for (let i = 0; i < dates.length; i++) {
      if (dailyObj[dates[i]]) {
        totals.push(dailyObj[dates[i]][0].total);
      } else {
        totals.push(0);
      }
    }
    const data = dates.map((date, idx) => {
      return {
        date: date,
        total: totals[idx],
      };
    });

    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};
const getSingleTagPieChart = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    let startTime = new Date(req.query.startTime);
    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    const utcStart = new Date(startTime.toUTCString().slice(0, -4));
    const utcEnd = new Date(endTime.toUTCString().slice(0, -4));
    const tagData = await Account.getMonthTagPie(bookId, utcStart, utcEnd);
    return res.status(200).send({ data: tagData });
  } catch (err) {
    console.log(err);
  }
};

const getMonthBalanceChart = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    let startTime = new Date(req.query.startTime);
    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    const utcStart = new Date(startTime.toUTCString().slice(0, -4));
    const utcEnd = new Date(endTime.toUTCString().slice(0, -4));
    const year = startTime.getFullYear();
    const month = startTime.getMonth() + 1;
    const result = await Account.getMonthOverview(bookId, utcStart, utcEnd);
    const dates = result.map((item) => item.date.toString().slice(8, 10));
    const day = new Date(year, month, 0).getDate();
    const days = [...Array(day)].map((_, i) => {
      return i + 1;
    });
    const expenses = [...Array(day)].map((_, i) => {
      return 0;
    });
    for (let i = 0; i < dates.length; i++) {
      let idx = parseInt(dates[i]);
      expenses[idx - 1] = parseInt(result[i].amount);
    }

    return res.status(200).send({ data: { days: days, expenses: expenses } });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getSingleDailyChart,
  getSingleTagPieChart,
  getMonthBalanceChart,
};
