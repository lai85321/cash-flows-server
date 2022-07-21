const Account = require("../models/account_model");
const getMonthRange = require("../util/getMonthRange");
const _ = require("lodash");

const getSingleTagPieChart = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const monthRange = getMonthRange(req.query.startTime);
    const data = await Account.getMonthTagPie(
      bookId,
      monthRange.start,
      monthRange.end
    );
    return res.status(200).send({ data });
  } catch (err) {
    console.log(err);
  }
};

const getMonthBalanceChart = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const monthRange = getMonthRange(req.query.startTime);
    const year = monthRange.start.getFullYear();
    const month = monthRange.start.getMonth() + 1;
    const result = await Account.getMonthOverview(
      bookId,
      monthRange.start,
      monthRange.end
    );
    const dates = result.map((item) => item.date.toString().slice(8, 10));
    const dayNums = new Date(year, month, 0).getDate();
    const days = [...Array(dayNums)].map((_, i) => {
      return i + 1;
    });
    const expenses = [...Array(dayNums)].map((_, i) => {
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
  getSingleTagPieChart,
  getMonthBalanceChart,
};
