const sqlBind = require("../util/sqlBind");
const db = require("../database");

const signUp = async (provider, name, email, pwdHash) => {
  try {
    let user = {
      provider: "native",
      name: name,
      email: email,
      password: pwdHash,
    };
    const sql = "INSERT INTO user SET ?";
    const result = await sqlBind(sql, user);
    user.id = result.insertId;
    console.log(15);
    console.log(user);
  } catch (error) {
    return {
      error: "Email Already Exists",
      status: 403,
    };
  }
};
const nativeSignIn = async (email) => {
  const result = await sqlBind(
    "SELECT * FROM user WHERE provider= 'native' and email=?",
    email
  );
  return result;
};
module.exports = {
  signUp,
  nativeSignIn,
};
