require("dotenv").config();
const User = require("../models/user_model");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { s3Upload } = require("../util/s3Service");
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
  if (name.trim() === "") {
    return res.status(400).send({ error: "Please enter a valid name" });
  }
  if (password.trim() === "") {
    return res.status(400).send({ error: "Please enter a valid password" });
  }
  const pwdHash = await bcrypt.hash(password, parseInt(SALTROUNDS));
  const user = [["native", name, email, pwdHash]];
  const response = await User.signUp(user);
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
      id: response.id,
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

const updateUser = async (req, res) => {
  try {
    const userId = req.query.id;
    if (req.file) {
      const uploadS3 = await s3Upload(userId, req.file);
      const uploadFile = req.file;
      const updateData = { picture: uploadFile.originalname };
      const result = await User.updateUser(updateData, userId);
      return res.status(200).send({ data: result[0] });
    } else {
      const updateData = req.body;
      if (updateData.name.trim() === "") {
        return res.status(400).send({ error: "Please enter a valid name" });
      }
      const result = await User.updateUser(updateData, userId);
      return res.status(200).send({ data: result[0] });
    }
  } catch (err) {
    console.log(err);
  }
};

const checkUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const result = await User.checkUser(userId);
    return res.status(200).send({ data: result[0] });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  userSignup,
  userSignin,
  updateUser,
  checkUser,
};
