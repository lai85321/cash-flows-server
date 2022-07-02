const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const { getCurrencyList } = require("../controllers/currency_controller");

router.route("/currency").get(auth, getCurrencyList);

module.exports = router;
