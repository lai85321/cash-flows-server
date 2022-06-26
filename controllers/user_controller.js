require("dotenv").config();
const User = require("../models/user_model");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { SALTROUNDS, JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const userSignup = async (req, res) => {
  let { name } = req.body;
  const { provider, email, password, picture } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({ error: "Please make sure the fields are valid" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Invalid email format" });
    return;
  }
  name = validator.escape(name);
  const pwdHash = await bcrypt.hash(password, parseInt(SALTROUNDS));
  const response = await User.signUp(provider, name, email, pwdHash);
  if (response.error) {
    return res.status(response.status).send({ error: response.error });
  }
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
      picture: picture,
    },
  };
  return res.status(200).send({ data: data });
};

const nativeSignin = async (email, password) => {
  if (!email || !password) {
    return {
      error: "Please make sure the fields are valid",
      status: 400,
    };
  }
  if (!validator.isEmail(email)) {
    return { error: "Invalid email format", statas: 400 };
  }
  const user = await User.nativeSignIn(email);
  if (user.length === 0) {
    return { error: "The email is invalid", status: 403 };
  } else {
    const match = await bcrypt.compare(password, user[0].password);
    if (match) {
      return user;
    } else {
      return { error: "The password is incorrect", statas: 403 };
    }
  }
};
const userSignin = async (req, res) => {
  const data = req.body;
  let result;
  switch (data.provider) {
    case "native":
      result = await nativeSignin(data.email, data.password);
      break;
    case "facebook":
      result = await facebookSignIn(data);
      break;
    default:
      result = { error: "Wrong Request" };
  }
  if (result.error) {
    const statusCode = result.status ? result.status : 403;
    res.status(statusCode).send({ error: result.error });
    return;
  }
  const token = jwt.sign(
    {
      provider: data.provider,
      name: result[0].name,
      email: result[0].email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const response = {
    access_token: token,
    access_expired: JWT_EXPIRES_IN,
    user: {
      id: result[0].id,
      provider: result[0].provider,
      name: result[0].name,
      email: result[0].email,
      picture: result[0].picture,
    },
  };
  return res.status(200).send({ data: response });
};
module.exports = {
  userSignup,
  userSignin,
};