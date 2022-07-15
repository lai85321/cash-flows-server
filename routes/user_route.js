const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const multer = require("multer");

const {
  userSignup,
  userSignin,
  userUpdate,
  userCheck,
} = require("../controllers/user_controller");

//multer setting
const storage = multer.memoryStorage();
const uploadPath = multer({
  storage,
  limits: {
    fileSize: 500000,
  },
});
const pictureUpload = uploadPath.single("picture");

router.route("/user/signup").post(userSignup);
router.route("/user/signin").post(userSignin);
router.route("/user").patch(auth, pictureUpload, userUpdate);
router.route("/user").get(auth, userCheck);

module.exports = router;
