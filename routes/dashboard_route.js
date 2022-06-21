const express = require("express");
const router = express.Router();

const { getSingleDailyChart } = require("../controllers/dashboard_controller");

router.route("/dashboard").get(getSingleDailyChart);

module.exports = router;
