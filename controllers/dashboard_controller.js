const Account = require("../models/account_model");
const _ = require("lodash");

const getSingleDailyChart = async (req, res) => {
  const bookId = req.query.bookId;
  const datesDesc = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toJSON().slice(5, 10);
  });
  const today = new Date();
  const dates = datesDesc.reverse();

  try {
    const dailyData = await Account.getLastWeekTotal(bookId, today);
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
const getSingleTagPieChart = async(req, res)=>{
  try{
    const bookId = req.query.bookId;
    let startTime = new Date(req.query.startTime);
    let endTime = new Date(req.query.startTime);
    endTime.setMonth(startTime.getMonth() + 1);
    startTime = startTime.toJSON().slice(0, 10);
    endTime = endTime.toJSON().slice(0, 10);
    const tagData = await Account.getMonthTagPie(bookId, startTime, endTime);  
    return res.status(200).send({data: tagData})
  } catch (err) {
    console.log(err);
  }
}
module.exports = {
  getSingleDailyChart,
  getSingleTagPieChart,
};
