/**
 * 行列演算（分数ベース）。
 *
 * 掃き出し法（Gauss-Jordan 法）で簡約行基本形（RREF）を求め、
 * そこからランク・解の種類・解空間の基底・自由変数を導く。
 * すべて Fraction で計算するため、浮動小数点誤差による誤判定が起きない。
 */
import { Fraction, frac } from "./fraction.js";

export type Mat = Fraction[][]; // 行 × 列

export function cloneMat(a: Mat): Mat {
  return a.map((row) => row.slice());
}

export function matFromInts(rows: number[][]): Mat {
  return rows.map((row) => row.map((v) => frac(v)));
}

/** ベクトルの配列（各要素が1本の列ベクトル）を、それらを列とする行列に変換する。 */
export function vectorsAsColumns(vectors: Fraction[][]): Mat {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const out: Mat = [];
  for (let i = 0; i < dim; i++) {
    out.push(vectors.map((v) => v[i]));
  }
  return out;
}

export function numRows(a: Mat): number {
  return a.length;
}

export function numCols(a: Mat): number {
  return a.length === 0 ? 0 : a[0].length;
}

/** 基本変形の種類。S02/S07 のステッパー表示に使う。 */
export type RowOp =
  | { kind: "scale"; row: number; factor: Fraction }
  | { kind: "swap"; rowA: number; rowB: number }
  | { kind: "addMultiple"; target: number; source: number; factor: Fraction };

export interface RrefStep {
  op: RowOp;
  description: string;
  matrixAfter: Mat;
  highlightRows: number[];
}

export interface RrefResult {
  matrix: Mat;
  steps: RrefStep[];
  pivotCols: number[]; // 各ピボットが現れる列番号（行順）
}

function describeOp(op: RowOp): string {
  const r = (i: number) => `第${i + 1}行`;
  switch (op.kind) {
    case "scale":
      return `${r(op.row)}を ${op.factor.toString()} 倍する`;
    case "swap":
      return `${r(op.rowA)}と${r(op.rowB)}を入れ替える`;
    case "addMultiple": {
      const f = op.factor;
      if (f.num < 0n) {
        return `${r(op.target)}から ${f.neg().toString()}×${r(op.source)} を引く`;
      }
      return `${r(op.target)}に ${f.toString()}×${r(op.source)} を加える`;
    }
  }
}

function applyOp(a: Mat, op: RowOp): Mat {
  const m = cloneMat(a);
  const cols = numCols(m);
  switch (op.kind) {
    case "scale":
      for (let j = 0; j < cols; j++) m[op.row][j] = m[op.row][j].mul(op.factor);
      break;
    case "swap":
      [m[op.rowA], m[op.rowB]] = [m[op.rowB], m[op.rowA]];
      break;
    case "addMultiple":
      for (let j = 0; j < cols; j++) {
        m[op.target][j] = m[op.target][j].add(m[op.source][j].mul(op.factor));
      }
      break;
  }
  return m;
}

/**
 * 簡約行基本形（RREF）を求め、各ステップを記録する。
 * 列数は augmented（拡大係数行列）であっても良い。全列を対象に簡約する。
 */
export function rrefWithSteps(input: Mat): RrefResult {
  let m = cloneMat(input);
  const rows = numRows(m);
  const cols = numCols(m);
  const steps: RrefStep[] = [];
  const pivotCols: number[] = [];

  let pivotRow = 0;
  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // ピボット候補（非ゼロ）を探す
    let sel = -1;
    for (let r = pivotRow; r < rows; r++) {
      if (!m[r][col].isZero()) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue; // この列はピボットにならない（自由変数の列）

    if (sel !== pivotRow) {
      const op: RowOp = { kind: "swap", rowA: pivotRow, rowB: sel };
      m = applyOp(m, op);
      steps.push({ op, description: describeOp(op), matrixAfter: cloneMat(m), highlightRows: [pivotRow, sel] });
    }

    const pivotVal = m[pivotRow][col];
    if (!pivotVal.equals(Fraction.one())) {
      const factor = Fraction.one().div(pivotVal);
      const op: RowOp = { kind: "scale", row: pivotRow, factor };
      m = applyOp(m, op);
      steps.push({ op, description: describeOp(op), matrixAfter: cloneMat(m), highlightRows: [pivotRow] });
    }

    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue;
      const target = m[r][col];
      if (target.isZero()) continue;
      const factor = target.neg();
      const op: RowOp = { kind: "addMultiple", target: r, source: pivotRow, factor };
      m = applyOp(m, op);
      steps.push({ op, description: describeOp(op), matrixAfter: cloneMat(m), highlightRows: [r, pivotRow] });
    }

    pivotCols.push(col);
    pivotRow++;
  }

  return { matrix: m, steps, pivotCols };
}

export function rref(input: Mat): Mat {
  return rrefWithSteps(input).matrix;
}

/** 行列のランク（= 簡約化後の非ゼロ行数 = ピボット数）。 */
export function rank(input: Mat): number {
  return rrefWithSteps(input).pivotCols.length;
}

/** 行列の転置。 */
export function transpose(a: Mat): Mat {
  const rows = numRows(a);
  const cols = numCols(a);
  const out: Mat = [];
  for (let j = 0; j < cols; j++) {
    const row: Fraction[] = [];
    for (let i = 0; i < rows; i++) row.push(a[i][j]);
    out.push(row);
  }
  return out;
}

export interface NullspaceResult {
  basis: Fraction[][]; // 各要素が1つの基底ベクトル（長さ = 列数）
  freeCols: number[];
  pivotCols: number[];
}

/**
 * 同次連立方程式 A x = 0 の解空間（核）の基底を求める（定理4.4.3 関連）。
 * RREF の主成分のない列（自由変数）ごとに、その変数を1、他の自由変数を0とおいて
 * 主成分の値を逆算することで基底ベクトルを1本ずつ作る。
 */
export function nullspace(a: Mat): NullspaceResult {
  const { matrix, pivotCols } = rrefWithSteps(a);
  const cols = numCols(a);
  const pivotSet = new Set(pivotCols);
  const freeCols: number[] = [];
  for (let c = 0; c < cols; c++) if (!pivotSet.has(c)) freeCols.push(c);

  const basis: Fraction[][] = [];
  for (const freeCol of freeCols) {
    const vec: Fraction[] = new Array(cols).fill(Fraction.zero());
    vec[freeCol] = Fraction.one();
    for (let pr = 0; pr < pivotCols.length; pr++) {
      const pc = pivotCols[pr];
      // ピボット行: x_pc + sum_{free} (matrix[pr][free] * x_free) = 0 → x_pc = -matrix[pr][freeCol]
      vec[pc] = matrix[pr][freeCol].neg();
    }
    basis.push(vec);
  }
  return { basis, freeCols, pivotCols };
}

export type SolveResult =
  | { type: "unique"; solution: Fraction[] }
  | { type: "infinite"; particular: Fraction[]; basis: Fraction[][]; freeCols: number[] }
  | { type: "none" };

/**
 * 連立一次方程式 A x = b を解く。拡大係数行列 [A|b] を RREF にし、
 * 「0 = 非ゼロ」の行があれば解なし、自由変数があれば不定解とする（定理4.4.3）。
 */
export function solveLinear(a: Mat, b: Fraction[]): SolveResult {
  const n = numCols(a); // 変数の数
  const augmented: Mat = a.map((row, i) => [...row, b[i]]);
  const { matrix, pivotCols } = rrefWithSteps(augmented);
  const rows = numRows(matrix);

  // 矛盾行のチェック: 係数部分が全部0なのに、定数項（最終列）が非ゼロ
  for (let r = 0; r < rows; r++) {
    let allZero = true;
    for (let c = 0; c < n; c++) {
      if (!matrix[r][c].isZero()) {
        allZero = false;
        break;
      }
    }
    if (allZero && !matrix[r][n].isZero()) {
      return { type: "none" };
    }
  }

  const pivotColsInA = pivotCols.filter((c) => c < n);
  const pivotSet = new Set(pivotColsInA);
  const freeCols: number[] = [];
  for (let c = 0; c < n; c++) if (!pivotSet.has(c)) freeCols.push(c);

  // 特殊解: 自由変数をすべて0とする
  const particular: Fraction[] = new Array(n).fill(Fraction.zero());
  for (let pr = 0; pr < pivotColsInA.length; pr++) {
    const pc = pivotColsInA[pr];
    particular[pc] = matrix[pr][n];
  }

  if (freeCols.length === 0) {
    return { type: "unique", solution: particular };
  }

  const basis: Fraction[][] = [];
  for (const freeCol of freeCols) {
    const vec: Fraction[] = new Array(n).fill(Fraction.zero());
    vec[freeCol] = Fraction.one();
    for (let pr = 0; pr < pivotColsInA.length; pr++) {
      const pc = pivotColsInA[pr];
      vec[pc] = matrix[pr][freeCol].neg();
    }
    basis.push(vec);
  }

  return { type: "infinite", particular, basis, freeCols };
}

/** 行列積 A × B。 */
export function matMul(a: Mat, b: Mat): Mat {
  const ra = numRows(a);
  const ca = numCols(a);
  const cb = numCols(b);
  const out: Mat = [];
  for (let i = 0; i < ra; i++) {
    const row: Fraction[] = [];
    for (let j = 0; j < cb; j++) {
      let sum = Fraction.zero();
      for (let k = 0; k < ca; k++) sum = sum.add(a[i][k].mul(b[k][j]));
      row.push(sum);
    }
    out.push(row);
  }
  return out;
}

/** 2×2 行列式。 */
export function det2(u1: Fraction[], u2: Fraction[]): Fraction {
  return u1[0].mul(u2[1]).sub(u1[1].mul(u2[0]));
}

/** 3×3 行列式（列ベクトル3本から、サラスの公式）。 */
export function det3(a: Fraction[], b: Fraction[], c: Fraction[]): Fraction {
  return a[0].mul(b[1]).mul(c[2])
    .add(a[1].mul(b[2]).mul(c[0]))
    .add(a[2].mul(b[0]).mul(c[1]))
    .sub(a[2].mul(b[1]).mul(c[0]))
    .sub(a[0].mul(b[2]).mul(c[1]))
    .sub(a[1].mul(b[0]).mul(c[2]));
}
