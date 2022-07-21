const pool = require("../database");

const signUp = async (user) => {
  try {
    const sql = "INSERT INTO user (provider, name, email, password) VALUES ?";
    const [result] = await pool.query(sql, [user]);
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

const updateUser = async (updateData, userId) => {
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

const checkUser = async (userId) => {
  const [result] = await pool.query(
    "SELECT * FROM user WHERE provider= 'native' and id=?",
    userId
  );
  return result;
};
module.exports = {
  signUp,
  nativeSignIn,
  updateUser,
  checkUser,
};
