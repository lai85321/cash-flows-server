const express = require("express");
const router = express.Router();

const { addMember, getMemberList } = require("../controllers/member_controller");

router.route("/members").post(addMember);
router.route("/members").get(getMemberList);

module.exports = router;