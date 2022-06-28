const express = require("express");
const router = express.Router();

const {
  getBalanceList,
  getGroupBalanceList,
  updateBalance,
} = require("../controllers/balance_controller");

router.route("/balance").get(getBalanceList);
router.route("/balance/group").get(getGroupBalanceList);
router.route("/balance").put(updateBalance);
module.exports = router;
