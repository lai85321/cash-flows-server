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

const accounts = [
  {
    id: 1,
    book_id: 1,
    paid_user_id: 1,
    tag_id: 1,
    type_id: 2,
    amount: 400,
    date: "2022-07-17 14:41:14",
    split: 1,
    note: "food",
    is_ignored: 0,
  },
  {
    id: 2,
    book_id: 1,
    paid_user_id: 1,
    tag_id: 1,
    type_id: 2,
    amount: 500,
    date: "2022-07-18 14:41:14",
    split: 1,
    note: "entertainment",
    is_ignored: 0,
  },
  {
    id: 3,
    book_id: 1,
    paid_user_id: 1,
    tag_id: 1,
    type_id: 2,
    amount: 300,
    date: "2022-07-18 14:41:14",
    split: 0,
    note: "food",
    is_ignored: 0,
  },
];

const splits = [
  {
    id: 1,
    account_id: 1,
    user_id: 1,
    paid_user_id: 2,
    split: 200,
    balance: -200,
    status: 0,
    split_start: null,
    split_end: null,
    current_balance: 0,
    is_calculated: 0,
    is_handwrited: 1,
  },
  {
    id: 2,
    account_id: 1,
    user_id: 2,
    paid_user_id: 1,
    split: 200,
    balance: 200,
    status: 0,
    split_start: null,
    split_end: null,
    current_balance: 0,
    is_calculated: 0,
    is_handwrited: 1,
  },
  {
    id: 3,
    account_id: 2,
    user_id: 1,
    paid_user_id: 2,
    split: 300,
    balance: -200,
    status: 0,
    split_start: null,
    split_end: null,
    current_balance: 0,
    is_calculated: 0,
    is_handwrited: 1,
  },
  {
    id: 4,
    account_id: 2,
    user_id: 2,
    paid_user_id: 1,
    split: 200,
    balance: 200,
    status: 0,
    split_start: null,
    split_end: null,
    current_balance: 0,
    is_calculated: 0,
    is_handwrited: 1,
  },
];

const types = [
  { id: 1, type: "income" },
  { id: 2, type: "expense" },
];

const tags = [
  { id: 1, type: "food" },
  { id: 2, type: "cloth" },
  { id: 3, type: "health" },
  { id: 4, type: "balanced" },
  { id: 5, type: "groceries" },
  { id: 6, type: "fare" },
  { id: 7, type: "entertainment" },
  { id: 8, type: "hotel" },
  { id: 9, type: "income" },
];

module.exports = {
  users,
  books,
  currency,
  members,
  accounts,
  splits,
  types,
  tags,
};
