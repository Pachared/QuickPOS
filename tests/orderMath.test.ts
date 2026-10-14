import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderTotal, roundMoney } from "../electron/orderMath";

test("roundMoney avoids floating-point totals in receipts", () => {
  assert.equal(roundMoney(0.1 + 0.2), 0.3);
});

test("calculateOrderTotal sums product prices and quantities", () => {
  assert.equal(
    calculateOrderTotal([
      { price: 12.5, qty: 2 },
      { price: 7.25, qty: 3 },
    ]),
    46.75
  );
});
