const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  addMember,
  getMemberList,
  deleteMember,
} = require("../controllers/member_controller");

router.route("/members").post(auth, addMember);
router.route("/members").get(auth, getMemberList);
router.route("/members").delete(auth, deleteMember);

module.exports = router;
