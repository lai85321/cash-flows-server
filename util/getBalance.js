function dfs(i, amounts, step, list) {
  if (i === amounts.length) {
    if (step <= minStep) {
      balanceList = [...list];
    }
    minStep = Math.min(minStep, step);
    return;
  }
  let cur = amounts[i];
  if (cur === 0) {
    dfs(i + 1, amounts, step, list);
  }
  for (let k = i + 1; k < amounts.length; k++) {
    let next = amounts[k];
    if (cur * next < 0) {
      let money = Math.min(Math.abs(cur), Math.abs(next));
      amounts[k] += cur;
      let pos = next;
      let neg = cur;
      if (cur > 0) {
        pos = cur;
        neg = next;
      }
      list.push([pos, neg, money]);
      dfs(i + 1, amounts, step + 1, list);
      amounts[k] -= cur;
      list.pop();
      if (cur + next === 0) break;
    }
  }
}

let minStep = Infinity; //step
let balanceList = [];
function backTrack(amounts) {
  dfs(0, amounts, 0, []);
  return balanceList;
}

function balance(amounts) {
  const balanceList = backTrack(amounts);
  let procedures = [];
  for (let i = 0; i < balanceList.length; i++) {
    let posIdx = amounts.findIndex((item) => item === balanceList[i][0]);
    let negIdx = amounts.findIndex((item) => item === balanceList[i][1]);
    amounts[posIdx] -= balanceList[i][2];
    amounts[negIdx] += balanceList[i][2];
    procedures.push([posIdx, negIdx, balanceList[i][2]]);
  }
  return procedures;
}

module.exports = balance;
