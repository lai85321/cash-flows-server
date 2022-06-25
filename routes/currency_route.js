const express = require("express");
const router = express.Router();

const { getCurrencyList } = require("../controllers/currency_controller");

router.route("/currency").get(getCurrencyList);

module.exports = router;
