const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  getSingleDailyChart,
  getSingleTagPieChart,
  getMonthBalanceChart,
} = require("../controllers/dashboard_controller");

router.route("/dashboard/singleDaily").get(auth, getSingleDailyChart);
router.route("/dashboard/singleTagPie").get(auth, getSingleTagPieChart);
router.route("/dashboard/monthBalance").get(auth, getMonthBalanceChart);

module.exports = router;
