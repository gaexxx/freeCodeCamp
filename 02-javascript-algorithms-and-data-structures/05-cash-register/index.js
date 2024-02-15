function checkCashRegister(price, cash, cid) {
  const conversion = {
    "ONE HUNDRED": 100,
    TWENTY: 20,
    TEN: 10,
    FIVE: 5,
    ONE: 1,
    QUARTER: 0.25,
    DIME: 0.1,
    NICKEL: 0.05,
    PENNY: 0.01,
  };

  let changeToGive = cash - price;
  let changeArray = [];
  const totalValueDrawer =
    Math.round(
      cid.reduce((accumulator, [, element]) => accumulator + element, 0) * 100
    ) / 100;

  if (changeToGive > totalValueDrawer || changeToGive < 0) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }

  if (changeToGive === 0) {
    return { status: "OPEN", change: [] };
  }

  for (let i = cid.length - 1; i >= 0; i--) {
    const [denomination, available] = cid[i];
    const value = conversion[denomination];
    let used = 0;

    while (changeToGive >= value && used < available) {
      changeToGive -= value;
      changeToGive = Math.round(changeToGive * 100) / 100;
      used += value;
    }

    if (used > 0) {
      changeArray.push([denomination, Math.round(used * 100) / 100]);
    }
  }

  if (changeToGive === 0 && cash - price === totalValueDrawer) {
    return { status: "CLOSED", change: cid };
  } else if (changeToGive === 0) {
    return { status: "OPEN", change: changeArray };
  } else {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }
}

console.log(
  checkCashRegister(19.5, 20, [
    ["PENNY", 0.5],
    ["NICKEL", 0],
    ["DIME", 0],
    ["QUARTER", 0],
    ["ONE", 0],
    ["FIVE", 0],
    ["TEN", 0],
    ["TWENTY", 0],
    ["ONE HUNDRED", 0],
  ])
);
