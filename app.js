require("dotenv").config();
const express = require("express");
const app = express();
const { PORT, API_VERSION } = process.env;
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/" + API_VERSION, [
  require("./routes/account_route"),
  require("./routes/balance_route"),
  require("./routes/book_route"),
  require("./routes/dashboard_route"),
  require("./routes/user_route"),
]);
// Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server is working on ${PORT}`);
});
