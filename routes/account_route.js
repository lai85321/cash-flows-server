const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  createAccount,
  getAccountList,
  getAccountDetail,
  getMemberOverview,
  deleteAccount,
} = require("../controllers/account_controller");

router.route("/accounts").post(auth, createAccount);
router.route("/accounts").get(auth, getAccountList);
router.route("/accounts").delete(auth, deleteAccount);
router.route("/accounts/detail").get(auth, getAccountDetail);
router.route("/accounts/member").get(auth, getMemberOverview);
module.exports = router;
