const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  getMessageList,
  updateNoticeStatus,
} = require("../controllers/message_controller");

router.route("/message").get(auth, getMessageList);

router.route("/message").patch(auth, updateNoticeStatus);

module.exports = router;
