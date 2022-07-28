const { expect, assert } = require("./set_up");
const balance = require("../util/getBalance");
const amount1 = [7, -3, 3, -7];
const amount2 = [1, 3, 5, -2, -7];
const amount3 = [1, -1, 0];
const amount4 = [-2, -5, 7];
const amount5 = [0, 0, 0];

describe("balance", async () => {
  it("calculate balance when 4 people", async () => {
    const procedure1 = await balance(amount1);
    expect(procedure1.length).equal(2);
  });

  it("calculate balance when complicated", async () => {
    const procedure2 = await balance(amount2);
    expect(procedure2.length).equal(4);
  });

  it("calculate balance when one 0", async () => {
    const procedure3 = await balance(amount3);
    expect(procedure3.length).equal(1);
  });

  it("calculate balance when 3 people", async () => {
    const procedure4 = await balance(amount4);
    expect(procedure4.length).equal(2);
  });

  it("calculate balance when all 0", async () => {
    const procedure5 = await balance(amount5);
    expect(procedure5.length).equal(0);
  });
});
