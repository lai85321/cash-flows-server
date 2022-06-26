const express = require("express");
const router = express.Router();

const { getSingleDailyChart, getSingleTagPieChart } = require("../controllers/dashboard_controller");

router.route("/dashboard/singleDaily").get(getSingleDailyChart);
router.route("/dashboard/singleTagPie").get(getSingleTagPieChart);

module.exports = router;
