const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  addMember,
  getMemberList,
  deleteMember,
  updateOpenTime,
} = require("../controllers/member_controller");

router.route("/members").post(auth, addMember);
router.route("/members").get(auth, getMemberList);
router.route("/members").delete(auth, deleteMember);

router.route("/members/openTime").get(auth, updateOpenTime);

module.exports = router;
