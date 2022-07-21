require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");
const pool = require("../database");

const expectedExpireTime = process.env.JWT_EXPIRES_IN;

describe("user", () => {
  before(() => {
    const userModel = require("../models/user_model");
  });

  it("sign up", async () => {
    const user = {
      id: 3,
      provider: "native",
      name: "tina",
      email: "tina@test.com",
      password: "password",
    };
    const res = await requester.post("/api/1.0/user/signup").send(user);
    const data = res.body.data;
    const userExpected = {
      id: data.user.id, // need id from returned data
      provider: "native",
      name: user.name,
      email: user.email,
    };

    expect(data.user).to.deep.equal(userExpected);
    expect(data.access_token).to.be.a("string");
    expect(data.access_expired).to.equal(expectedExpireTime);
  });

  it("sign up without name or email or password", async () => {
    const user1 = {
      email: "tina@test.com",
      password: "password",
    };

    const res1 = await requester.post("/api/1.0/user/signup").send(user1);

    expect(res1.statusCode).to.equal(400);

    const user2 = {
      name: "tina",
      password: "password",
    };

    const res2 = await requester.post("/api/1.0/user/signup").send(user2);

    expect(res2.statusCode).to.equal(400);

    const user3 = {
      name: "tina",
      email: "tina@test.com",
    };

    const res3 = await requester.post("/api/1.0/user/signup").send(user3);

    expect(res3.statusCode).to.equal(400);

    const user4 = {
      name: "tina",
      email: "tina",
    };

    const res4 = await requester.post("/api/1.0/user/signup").send(user4);

    expect(res4.statusCode).to.equal(400);
  });

  it("sign up with existed email", async () => {
    const user = {
      name: users[0].name,
      email: users[0].email,
      password: "password",
    };
    const res = await requester.post("/api/1.0/user/signup").send(user);
    expect(res.body.error).to.equal("Email Already Exists");
  });
  after(() => {});
});
