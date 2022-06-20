const express = require("express");
const router = express.Router();

const { getBalanceList } = require("../controllers/balance_controller");

router.route("/balance").get(getBalanceList);

module.exports = router;
