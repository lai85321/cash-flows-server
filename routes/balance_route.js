const express = require("express");
const router = express.Router();

const {
  getBalanceList,
  getGroupBalanceList,
} = require("../controllers/balance_controller");

router.route("/balance").get(getBalanceList);
router.route("/balance/group").get(getGroupBalanceList);

module.exports = router;
