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
  const today = new Date();
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
    startTime = startTime.toJSON().slice(0, 10);
    endTime = endTime.toJSON().slice(0, 10);
    const tagData = await Account.getMonthTagPie(bookId, startTime, endTime);
    return res.status(200).send({ data: tagData });
  } catch (err) {
    console.log(err);
  }
};

const getSingleMemberDailyChart = async (req, res) => {
  const bookId = parseInt(req.query.bookId);
  const datesDesc = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toJSON().slice(5, 10);
  });
  const today = new Date();
  const dates = datesDesc.reverse();

  try {
    const unsplitResult = await Account.getWeekUnsplit(bookId);
    const unsplits = await _.groupBy(unsplitResult, (r) =>
      r.date.toJSON().slice(5, 10)
    );
    const balancedResult = await Account.getWeekBalanced(bookId);
    const balanceds = await _.groupBy(balancedResult, (r) =>
      r.date.toJSON().slice(5, 10)
    );
    const unbalancedResult = await Account.getWeekUnbalanced(bookId);
    const unbalanceds = await _.groupBy(unbalancedResult, (r) =>
      r.date.toJSON().slice(5, 10)
    );
    const members = await Member.getMemberList(parseInt(bookId));
    const memberIds = members.map((item) => item.id);

    let dailyData = {};

    for (let i = 0; i < dates.length; i++) {
      dailyData[dates[i]] = [];
      for (let j = 0; j < memberIds.length; j++) {
        let sum = 0;
        if (unsplits[dates[i]]) {
          let unsplitItem = unsplits[dates[i]].filter(
            (item, idx) => item.paid_user_id == memberIds[j]
          );
          if (unsplitItem.length !== 0) {
            let unsplit = unsplitItem[0].unsplit
              ? parseInt(unsplitItem[0].unsplit)
              : 0;
            sum = sum + unsplit;
          }
        }
        if (balanceds[dates[i]]) {
          let balancedItem = balanceds[dates[i]].filter(
            (item, idx) => item.user_id == memberIds[j]
          );
          if (balancedItem.length !== 0) {
            let balanced = balancedItem[0].balanced
              ? parseInt(balancedItem[0].balanced)
              : 0;
            sum = sum + balanced;
          }
        }
        if (unbalanceds[dates[i]]) {
          let unbalancedItem = unbalanceds[dates[i]].filter(
            (item, idx) => item.user_id == memberIds[j]
          );
          if (unbalancedItem.length !== 0) {
            let unbalanced = unbalancedItem[0].unbalanced
              ? parseInt(unbalancedItem[0].unbalanced)
              : 0;
            sum = sum - unbalanced;
          }
        }

        dailyData[dates[i]].push({ [memberIds[j]]: sum });
      }
    }
    const data = dates.map((date, idx) => {
      return {
        date: date,
        total: memberIds.map((id, index) => {
          return dailyData[date][index];
        }),
      };
    });
    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getSingleDailyChart,
  getSingleTagPieChart,
  getSingleMemberDailyChart,
};
