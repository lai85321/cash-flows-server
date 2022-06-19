const express = require("express");
const router = express.Router();

const {
  createAccount,
  getAccountList,
} = require("../controllers/account_controller");

router.route("/accounts").post(createAccount);
router.route("/accounts").get(getAccountList);

module.exports = router;
