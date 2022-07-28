const Currrency = require("../models/currency_model");

const getCurrencyList = async (req, res) => {
  try {
    const result = await Currrency.getCurrencyList()
    return res.status(200).send({data:result})
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
    getCurrencyList
};
