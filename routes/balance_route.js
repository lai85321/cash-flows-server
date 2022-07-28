const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  getBalanceList,
  getGroupBalanceList,
  updateSplitStatus,
} = require("../controllers/balance_controller");

router.route("/balance").get(auth, getBalanceList);
router.route("/balance/group").get(auth, getGroupBalanceList);
router.route("/balance/settle").get(auth, updateSplitStatus);
module.exports = router;
