require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");

const user = {
  provider: users[0].provider,
  email: users[0].email,
  password: users[0].password,
};
let accessToken;

describe("member", () => {
  before(async () => {
    const res = await requester.post("/api/1.0/user/signin").send(user);
    accessToken = res.body.data.access_token;
  });

  it("get book1 member", async () => {
    const res = await requester
      .get("/api/1.0/members?bookId=1")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;

    expect(data.length).equal(2);
    expect(data[1].name).equal("test2");
  });

  it("get book2 member", async () => {
    const res = await requester
      .get("/api/1.0/members?bookId=2")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;
    expect(data.length).equal(1);
    expect(data[0].name).equal("test1");
  });

  it("get member when book is not exist", async () => {
    const res = await requester
      .get("/api/1.0/members?bookId=3")
      .set("Authorization", `Bearer ${accessToken}`);
    const data = res.body.data;
    expect(data.length).equal(0);
  });
  after(() => {});
});
