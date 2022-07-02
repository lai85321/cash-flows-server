const express = require("express");
const router = express.Router();

const {
  addMember,
  getMemberList,
  deleteMember,
} = require("../controllers/member_controller");

router.route("/members").post(addMember);
router.route("/members").get(getMemberList);
router.route("/members").delete(deleteMember);

module.exports = router;
