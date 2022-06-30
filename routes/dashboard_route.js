const express = require("express");
const router = express.Router();

const {
  getSingleDailyChart,
  getSingleTagPieChart,
  getSingleMemberDailyChart,
} = require("../controllers/dashboard_controller");

router.route("/dashboard/singleDaily").get(getSingleDailyChart);
router.route("/dashboard/singleTagPie").get(getSingleTagPieChart);
router.route("/dashboard/singleMemberDaily").get(getSingleMemberDailyChart);

module.exports = router;
