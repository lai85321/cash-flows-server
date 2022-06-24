const express = require("express");
const router = express.Router();

const { userSignup, userSignin } = require("../controllers/user_controller");

router.route("/user/signup").post(userSignup);
router.route("/user/signin").post(userSignin);

module.exports = router;
