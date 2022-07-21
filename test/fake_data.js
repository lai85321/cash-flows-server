const users = [
  {
    id: 1,
    provider: "native",
    email: "test1@test.com",
    password: "test1password",
    name: "test1",
    picture: null,
  },
  {
    id: 2,
    provider: "native",
    email: "test2@test.com",
    password: "test2passwod",
    name: "test2",
    picture: null,
    access_token: "test2accesstoken",
    access_expired: 0,
  },
];

const books = [
  {
    id: 1,
    name: "book1",
    currency_id: 1,
    image: null,
    budget: 1000,
  },
  {
    id: 2,
    name: "book2",
    currency_id: 2,
    image: null,
    budget: 2000,
  },
];

const currency = [
  {
    id: 1,
    currency: "TWD",
  },
  {
    id: 2,
    currency: "USD",
  },
];

const members = [
  {
    id: 1,
    book_id: 1,
    user_id: 1,
  },
  {
    id: 2,
    book_id: 1,
    user_id: 2,
  },
  {
    id: 3,
    book_id: 2,
    user_id: 1,
  },
];

module.exports = {
  users,
  books,
  currency,
  members,
};
