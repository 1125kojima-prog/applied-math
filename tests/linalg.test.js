import { test } from "node:test";
import assert from "node:assert/strict";
import { frac } from "../js/math/fraction.js";
import { isIndependent, nontrivialDependency, coordinates, checkBasis, extractMaximalIndependent, polyEval, polyDerivative, } from "../js/math/linalg.js";
test("isIndependent: 第3回の例 u1=(1,1,0),u2=(0,1,1),u3=(1,2,1) は1次従属", () => {
    const u1 = [frac(1), frac(1), frac(0)];
    const u2 = [frac(0), frac(1), frac(1)];
    const u3 = [frac(1), frac(2), frac(1)];
    assert.equal(isIndependent([u1, u2, u3]), false);
    const dep = nontrivialDependency([u1, u2, u3]);
    assert.ok(dep);
    // c3 を 1 とした代表解で c1=-1, c2=-1, c3=1 の比になっているはず
    if (dep) {
        const [c1, c2, c3] = dep;
        assert.ok(!c3.isZero());
        const ratio1 = c1.div(c3);
        const ratio2 = c2.div(c3);
        assert.equal(ratio1.toString(), "-1");
        assert.equal(ratio2.toString(), "-1");
    }
});
test("isIndependent: 標準基底 e1,e2,e3 は1次独立", () => {
    const e1 = [frac(1), frac(0), frac(0)];
    const e2 = [frac(0), frac(1), frac(0)];
    const e3 = [frac(0), frac(0), frac(1)];
    assert.equal(isIndependent([e1, e2, e3]), true);
    assert.equal(nontrivialDependency([e1, e2, e3]), null);
});
test("coordinates: [3,-2] を基底 {(1,2),(-2,0)} で表す → c1=-1, c2=-2", () => {
    const u1 = [frac(1), frac(2)];
    const u2 = [frac(-2), frac(0)];
    const x = [frac(3), frac(-2)];
    const result = coordinates([u1, u2], x);
    assert.equal(result.ok, true);
    if (result.ok) {
        assert.equal(result.coeffs[0].toString(), "-1");
        assert.equal(result.coeffs[1].toString(), "-2");
    }
});
test("checkBasis: 平行な2本はR^2の基底ではない", () => {
    const u1 = [frac(1), frac(2)];
    const u2 = [frac(2), frac(4)];
    const check = checkBasis([u1, u2], 2);
    assert.equal(check.isBasis, false);
    assert.equal(check.isIndependent, false);
});
test("checkBasis: 標準基底はR^2の基底である", () => {
    const e1 = [frac(1), frac(0)];
    const e2 = [frac(0), frac(1)];
    const check = checkBasis([e1, e2], 2);
    assert.equal(check.isBasis, true);
});
test("extractMaximalIndependent: 例題4.3.1（ノートp.43）a1..a5 → rank3, {a1,a2,a4}が極大独立, a3=-a1+2a2, a5=2a1-a2+a4", () => {
    const a1 = [1, 1, 3, 0].map((v) => frac(v));
    const a2 = [1, 2, 0, -1].map((v) => frac(v));
    const a3 = [1, 3, -3, -2].map((v) => frac(v));
    const a4 = [-2, -4, 1, -1].map((v) => frac(v));
    const a5 = [-1, -4, 7, 0].map((v) => frac(v));
    const vectors = [a1, a2, a3, a4, a5];
    const result = extractMaximalIndependent(vectors);
    assert.equal(result.rank, 3);
    assert.deepEqual(result.pivotIndices, [0, 1, 3]); // a1,a2,a4 がピボット列
    const coeff3 = result.combinations.get(2);
    assert.ok(coeff3);
    if (coeff3) {
        assert.equal(coeff3[0].toString(), "-1"); // a1 の係数
        assert.equal(coeff3[1].toString(), "2"); // a2 の係数
        assert.equal(coeff3[2].toString(), "0"); // a4 の係数
    }
    const coeff5 = result.combinations.get(4);
    assert.ok(coeff5);
    if (coeff5) {
        assert.equal(coeff5[0].toString(), "2");
        assert.equal(coeff5[1].toString(), "-1");
        assert.equal(coeff5[2].toString(), "1");
    }
});
test("extractMaximalIndependent: 例題4.3.2（ノートp.46）多項式5個 f1..f5 → rank3, {f1,f2,f4}が極大独立", () => {
    // f1=1+x+3x^2, f2=1+2x-x^3, f3=1+3x-3x^2-2x^3, f4=-2-4x+x^2-x^3, f5=-1-4x+7x^2
    const f1 = [1, 1, 3, 0].map((v) => frac(v));
    const f2 = [1, 2, 0, -1].map((v) => frac(v));
    const f3 = [1, 3, -3, -2].map((v) => frac(v));
    const f4 = [-2, -4, 1, -1].map((v) => frac(v));
    const f5 = [-1, -4, 7, 0].map((v) => frac(v));
    const result = extractMaximalIndependent([f1, f2, f3, f4, f5]);
    assert.equal(result.rank, 3);
    assert.deepEqual(result.pivotIndices, [0, 1, 3]);
});
test("polyEval / polyDerivative: f(x)=1+x+3x^2 の f(1) と導関数", () => {
    const coeffs = [frac(1), frac(1), frac(3), frac(0)];
    assert.equal(polyEval(coeffs, frac(1)).toString(), "5");
    const d = polyDerivative(coeffs);
    // f'(x) = 1 + 6x
    assert.equal(d[0].toString(), "1");
    assert.equal(d[1].toString(), "6");
    assert.equal(d[2].toString(), "0");
});
//# sourceMappingURL=linalg.test.js.map