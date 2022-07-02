const express = require("express");
const router = express.Router();
const auth = require("../util/auth");
const { createBook, getBookList } = require("../controllers/book_controller");

router.route("/books").post(auth, createBook);
router.route("/books").get(auth, getBookList);

module.exports = router;
