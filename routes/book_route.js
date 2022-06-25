const express = require("express");
const router = express.Router();

const { createBook,getBookList } = require("../controllers/book_controller");

router.route("/books").post(createBook);
router.route("/books").get(getBookList);

module.exports = router;
