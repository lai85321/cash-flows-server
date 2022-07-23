require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");

const user = {
  provider: users[0].provider,
  email: users[0].email,
  password: users[0].password,
};
let accessToken;

describe("balance", () => {
  before(async () => {
    const res = await requester.post("/api/1.0/user/signin").send(user);
    accessToken = res.body.data.access_token;
  });

  it("get balance1", async () => {
    const res = await requester
      .get("/api/1.0/balance?bookId=1")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;
    expect(data[0].details.length).equal(2);
  });
  it("get balance1", async () => {
    const res = await requester
      .get("/api/1.0/balance?bookId=1")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;
    expect(data[1].details.length).equal(2);
  });
  it("get balance1", async () => {
    const res = await requester
      .get("/api/1.0/balance?bookId=2")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;
    expect(data.length).equal(0);
  });

  after(() => {});
});
