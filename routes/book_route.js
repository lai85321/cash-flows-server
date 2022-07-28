const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const {
  createBook,
  getBookList,
  updateBudget,
} = require("../controllers/book_controller");

router.route("/books").post(auth, createBook);
router.route("/books").get(auth, getBookList);
router.route("/books").patch(auth, updateBudget);

module.exports = router;
