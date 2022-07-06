const pool = require("../database");

const signUp = async (provider, name, email, pwdHash) => {
  try {
    let user = {
      provider: "native",
      name: name,
      email: email,
      password: pwdHash,
    };
    const sql = "INSERT INTO user SET ?";
    const result = await pool.query(sql, [user]);
    user.id = result.insertId;
    return user;
  } catch (error) {
    return {
      error: "Email Already Exists",
      status: 403,
    };
  }
};
const nativeSignIn = async (email) => {
  const [result] = await pool.query(
    "SELECT * FROM user WHERE provider= 'native' and email=?",
    email
  );
  return result;
};

const userUpdate = async (updateData, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    await conn.query("UPDATE user SET ? WHERE id=?", [updateData, userId]);
    const [result] = await conn.query("SELECT * FROM user WHERE id=?", [
      userId,
    ]);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  userUpdate,
};
