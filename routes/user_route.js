const express = require("express");
const router = express.Router();

const { userSignup } = require("../controllers/user_controller");

router.route("/user/signup").post(userSignup);

module.exports = router;
