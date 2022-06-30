const express = require("express");
const router = express.Router();

const {
  createAccount,
  getAccountList,
  getMemberOverview,
} = require("../controllers/account_controller");

router.route("/accounts").post(createAccount);
router.route("/accounts").get(getAccountList);
router.route("/accounts/member").get(getMemberOverview);
module.exports = router;
