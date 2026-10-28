import { test } from "node:test";
import assert from "node:assert/strict";
import { frac } from "../js/math/fraction.js";
import { matFromInts, rref, rank, nullspace, solveLinear, transpose } from "../js/math/matrix.js";
test("rref: 事前学習2の例 2x+3y-z=-3, -x+2y+2z=1, x+y-z=-2 → (1,-1,2)", () => {
    const A = matFromInts([
        [2, 3, -1],
        [-1, 2, 2],
        [1, 1, -1],
    ]);
    const b = [frac(-3), frac(1), frac(-2)];
    const result = solveLinear(A, b);
    assert.equal(result.type, "unique");
    if (result.type === "unique") {
        assert.equal(result.solution[0].toString(), "1");
        assert.equal(result.solution[1].toString(), "-1");
        assert.equal(result.solution[2].toString(), "2");
    }
});
test("rank: 例題4.2.1 a1=(2,1,-3,1) a2=(1,0,1,0) a3=(3,1,2,2) → rank 3", () => {
    // 列ベクトルとして行列を作る（4行3列）
    const A = matFromInts([
        [2, 1, 3],
        [1, 0, 1],
        [-3, 1, 2],
        [1, 0, 2],
    ]);
    assert.equal(rank(A), 3);
});
test("rref: 既に単位行列なら変化しない", () => {
    const A = matFromInts([
        [1, 0],
        [0, 1],
    ]);
    const r = rref(A);
    assert.equal(r[0][0].toString(), "1");
    assert.equal(r[0][1].toString(), "0");
    assert.equal(r[1][0].toString(), "0");
    assert.equal(r[1][1].toString(), "1");
});
test("nullspace: 例題4.4.1 A=[[1,-2,1,2,3],[2,-4,3,3,8]] の解空間の基底", () => {
    const A = matFromInts([
        [1, -2, 1, 2, 3],
        [2, -4, 3, 3, 8],
    ]);
    const { basis } = nullspace(A);
    assert.equal(basis.length, 3);
    const asStrings = basis.map((v) => v.map((f) => f.toString()).join(","));
    assert.ok(asStrings.includes("2,1,0,0,0"));
    assert.ok(asStrings.includes("-3,0,1,1,0"));
    assert.ok(asStrings.includes("-1,0,-2,0,1"));
});
test("solveLinear: 解なしの例", () => {
    const A = matFromInts([
        [1, 1],
        [1, 1],
    ]);
    const b = [frac(1), frac(2)];
    const result = solveLinear(A, b);
    assert.equal(result.type, "none");
});
test("solveLinear: 不定解の例（自由変数あり）", () => {
    const A = matFromInts([[1, 1]]);
    const b = [frac(2)];
    const result = solveLinear(A, b);
    assert.equal(result.type, "infinite");
    if (result.type === "infinite") {
        assert.equal(result.freeCols.length, 1);
    }
});
test("transpose: 転置の基本動作", () => {
    const A = matFromInts([
        [1, 2, 3],
        [4, 5, 6],
    ]);
    const t = transpose(A);
    assert.equal(t.length, 3);
    assert.equal(t[0].length, 2);
    assert.equal(t[2][1].toString(), "6");
});
//# sourceMappingURL=matrix.test.js.map