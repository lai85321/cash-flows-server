require("dotenv").config();
const { NODE_ENV } = process.env;
const bcrypt = require("bcrypt");
const {
  users,
  books,
  currency,
  members,
  tags,
  types,
  accounts,
  splits,
} = require("./fake_data");
const pool = require("../database");
const { SALTROUNDS } = process.env;

async function _createFakeUser(conn) {
  const encryped_users = users.map((user) => {
    const encryped_user = {
      id: user.id,
      provider: user.provider,
      email: user.email,
      password: user.password
        ? bcrypt.hashSync(user.password, parseInt(SALTROUNDS))
        : null,
      name: user.name,
      picture: user.picture,
    };
    return encryped_user;
  });
  return await conn.query(
    "INSERT INTO user (id, provider, email, password, name, picture) VALUES ?",
    [encryped_users.map((x) => Object.values(x))]
  );
}

async function _createFakeCurrency(conn) {
  return await conn.query("INSERT INTO currency (id, currency) VALUES ?", [
    currency.map((x) => Object.values(x)),
  ]);
}

async function _createFakeBook(conn) {
  return await conn.query(
    "INSERT INTO book (id, name, currency_id, image, budget) VALUES ?",
    [books.map((x) => Object.values(x))]
  );
}

async function _createFakeMember(conn) {
  return await conn.query(
    "INSERT INTO member (id, book_id, user_id) VALUES ?",
    [members.map((x) => Object.values(x))]
  );
}

async function _createFakeTag(conn) {
  return await conn.query("INSERT INTO tag (id, tag) VALUES ?", [
    tags.map((x) => Object.values(x)),
  ]);
}

async function _createFakeType(conn) {
  return await conn.query("INSERT INTO type (id, type) VALUES ?", [
    types.map((x) => Object.values(x)),
  ]);
}

async function _createFakeAccount(conn) {
  return await conn.query(
    "INSERT INTO account (id, book_id, paid_user_id, tag_id, type_id, amount, date, split, note, is_ignored) VALUES ?",
    [accounts.map((x) => Object.values(x))]
  );
}

async function _createFakeSplit(conn) {
  return await conn.query(
    "INSERT INTO split (id, account_id, user_id, paid_user_id, split, balance, status, split_start, split_end, current_balance, is_calculated, is_handwrited) VALUES ?",
    [splits.map((x) => Object.values(x))]
  );
}

async function createFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await _createFakeUser(conn);
  await _createFakeCurrency(conn);
  await _createFakeBook(conn);
  await _createFakeMember(conn);
  await _createFakeTag(conn);
  await _createFakeAccount(conn);
  await _createFakeSplit(conn);
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
}

async function truncateFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
    return;
  };
  const tables = [
    "user",
    "currency",
    "book",
    "member",
    "tag",
    "type",
    "account",
    "split",
  ];
  for (let table of tables) {
    await truncateTable(table);
  }
  return;
}

async function closeConnection() {
  return await pool.end();
}

async function main() {
  await truncateFakeData();
  await createFakeData();
  await closeConnection();
}

// execute when called directly.
if (require.main === module) {
  main();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
