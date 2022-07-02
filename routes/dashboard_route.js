const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  getSingleDailyChart,
  getSingleTagPieChart,
  getSingleMemberDailyChart,
} = require("../controllers/dashboard_controller");

router.route("/dashboard/singleDaily").get(auth, getSingleDailyChart);
router.route("/dashboard/singleTagPie").get(auth, getSingleTagPieChart);
router
  .route("/dashboard/singleMemberDaily")
  .get(auth, getSingleMemberDailyChart);

module.exports = router;
