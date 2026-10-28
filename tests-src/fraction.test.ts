import { test } from "node:test";
import assert from "node:assert/strict";
import { Fraction, frac } from "../js/math/fraction.js";

test("加減乗除の基本", () => {
  assert.equal(frac(1, 2).add(frac(1, 3)).toString(), "5/6");
  assert.equal(frac(1, 2).sub(frac(1, 3)).toString(), "1/6");
  assert.equal(frac(2, 3).mul(frac(3, 4)).toString(), "1/2");
  assert.equal(frac(1, 2).div(frac(1, 4)).toString(), "2");
});

test("約分される", () => {
  assert.equal(frac(4, 8).toString(), "1/2");
  assert.equal(frac(-4, 8).toString(), "-1/2");
});

test("符号は分子に寄せる", () => {
  const f = frac(3, -4);
  assert.equal(f.num, -3n);
  assert.equal(f.den, 4n);
});

test("ゼロ除算は例外", () => {
  assert.throws(() => frac(1, 1).div(frac(0, 1)));
  assert.throws(() => new Fraction(1, 0));
});

test("0.1+0.2相当の誤差が出ないこと（1/10 + 2/10 = 3/10）", () => {
  assert.equal(frac(1, 10).add(frac(2, 10)).toString(), "3/10");
  assert.ok(frac(1, 10).add(frac(2, 10)).equals(frac(3, 10)));
});

test("整数のときは分母を表示しない", () => {
  assert.equal(frac(6, 3).toString(), "2");
});
