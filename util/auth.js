const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const auth = function (req, res, next) {
  try {
    if (req.headers.authorization) {
      const authHeader = req.get("Authorization");
      const token = authHeader.split(" ")[1];
      res.locals.verify = jwt.verify(token, jwtSecret);
      next();
    } else {
      return res.status(401).send({ error: "There is no token" });
    }
  } catch (err) {
    return res.status(401).send({ error: "Token expired" });
  }
};

module.exports = auth;
