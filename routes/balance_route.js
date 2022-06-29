const express = require("express");
const router = express.Router();

const {
  getBalanceList,
  getGroupBalanceList,
  updateSplitStatus,
} = require("../controllers/balance_controller");

router.route("/balance").get(getBalanceList);
router.route("/balance/group").get(getGroupBalanceList);
router.route("/balance/settle").get(updateSplitStatus);
module.exports = router;
