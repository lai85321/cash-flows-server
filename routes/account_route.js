const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  createAccount,
  getAccountList,
  getMemberOverview,
} = require("../controllers/account_controller");

router.route("/accounts").post(auth, createAccount);
router.route("/accounts").get(auth, getAccountList);
router.route("/accounts/member").get(auth, getMemberOverview);
module.exports = router;
