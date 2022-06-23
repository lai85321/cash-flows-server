const sqlBind = require("../util/sqlBind");
const db = require("../database");

const signUp = async (provider, name, email, pwdHash) => {
  try {
    const user = {
      provider: "native",
      name: name,
      email: email,
      password: pwdHash,
    };
    const sql = "INSERT INTO user SET ?";
    const [result] = await sqlBind(sql, user);
    user.id = result.insertId;
    return { user };
  } catch (error) {
    return {
      error: "Email Already Exists",
      status: 403,
    };
  }
};
module.exports = {
  signUp,
};
