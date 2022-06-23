require("dotenv").config();
const User = require("../models/user_model");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { SALTROUNDS, JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const userSignup = async (req, res) => {
  let { name } = req.body;
  const { provider, email, password } = req.body;

  if (!name || !email || !password) {
    res
      .status(400)
      .send({ error: "Request Error: Please make sure the fields are valid" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Invalid email format" });
    return;
  }
  name = validator.escape(name);
  const pwdHash = await bcrypt.hash(password, parseInt(SALTROUNDS));
  const user = await User.signUp(provider, name, email, pwdHash);
  const token = jwt.sign(
    {
      provider: provider,
      name: name,
      email: email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const data = {
    access_token: token,
    access_expired: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      provider: provider,
      name: name,
      email: email,
    },
  };
  return res.status(200).send({ data: data });
};

module.exports = {
  userSignup,
};
