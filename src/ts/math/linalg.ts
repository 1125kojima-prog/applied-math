/**
 * ベクトル・多項式の基本演算と、1次独立性・基底・座標・部分空間の判定に使う
 * 高レベルのヘルパー関数群。すべて Fraction ベースの厳密計算。
 */
import { Fraction, frac } from "./fraction.js";
import { Mat, rrefWithSteps, rank, vectorsAsColumns, numCols, nullspace } from "./matrix.js";

// --- 座標ベクトルの基本演算（R^n にも、多項式の係数ベクトルにも使える） ---

export function zeroVec(n: number): Fraction[] {
  return new Array(n).fill(Fraction.zero());
}

export function vecAdd(a: Fraction[], b: Fraction[]): Fraction[] {
  return a.map((v, i) => v.add(b[i]));
}

export function vecSub(a: Fraction[], b: Fraction[]): Fraction[] {
  return a.map((v, i) => v.sub(b[i]));
}

export function vecScale(c: Fraction, a: Fraction[]): Fraction[] {
  return a.map((v) => v.mul(c));
}

export function vecEquals(a: Fraction[], b: Fraction[]): boolean {
  return a.length === b.length && a.every((v, i) => v.equals(b[i]));
}

export function vecIsZero(a: Fraction[]): boolean {
  return a.every((v) => v.isZero());
}

// --- 多項式（係数ベクトル [a0, a1, a2, a3] = a0 + a1 x + a2 x^2 + a3 x^3） ---

export function polyEval(coeffs: Fraction[], x: Fraction): Fraction {
  let acc = Fraction.zero();
  for (let k = coeffs.length - 1; k >= 0; k--) {
    acc = acc.mul(x).add(coeffs[k]);
  }
  return acc;
}

/** 係数ベクトルを KaTeX 用の多項式の文字列（例: "1 + x + 3x^2"）に変換する。 */
export function polyToLatex(coeffs: Fraction[]): string {
  const vars = ["", "x", "x^2", "x^3", "x^4", "x^5"];
  const terms: string[] = [];
  coeffs.forEach((c, k) => {
    if (c.isZero()) return;
    if (k === 0) {
      terms.push(c.toLatex());
      return;
    }
    if (c.equals(Fraction.one())) terms.push(vars[k]);
    else if (c.equals(Fraction.one().neg())) terms.push(`-${vars[k]}`);
    else terms.push(`${c.toLatex()}${vars[k]}`);
  });
  if (terms.length === 0) return "0";
  return terms.join(" + ").replace(/\+ -/g, "- ");
}

/** 多項式の導関数の係数ベクトル（同じ長さで、最高次の係数は0になる）。 */
export function polyDerivative(coeffs: Fraction[]): Fraction[] {
  const out = zeroVec(coeffs.length);
  for (let k = 1; k < coeffs.length; k++) {
    out[k - 1] = coeffs[k].mul(frac(k));
  }
  return out;
}

// --- 1次独立性・ランク・最大独立組（定理4.2.1, 4.3.2, 4.3.6 関連） ---

export function vectorsToMatrix(vectors: Fraction[][]): Mat {
  return vectorsAsColumns(vectors);
}

/** ベクトルの組が1次独立か（rank(A) = 本数）。 */
export function isIndependent(vectors: Fraction[][]): boolean {
  if (vectors.length === 0) return true;
  return rank(vectorsToMatrix(vectors)) === vectors.length;
}

/**
 * 1次従属なとき、非自明な係数 (c1,...,cn)（すべて0ではない）を1組返す。
 * A c = 0 の解空間（核）の基底の最初の1本を使う（定理4.2.1）。
 * 独立なときは null を返す。
 */
export function nontrivialDependency(vectors: Fraction[][]): Fraction[] | null {
  if (isIndependent(vectors)) return null;
  const A = vectorsToMatrix(vectors);
  const { basis } = nullspace(A);
  return basis[0];
}

export interface MaximalIndependentResult {
  rrefMatrix: Mat;
  pivotIndices: number[]; // 元のベクトルの配列における、最大1次独立組の添字（0始まり）
  rank: number;
  /** ピボットでない添字 j について、vectors[j] を pivotIndices のベクトルの1次結合で表す係数 */
  combinations: Map<number, Fraction[]>;
}

/**
 * ベクトルの組から、1次独立な最大個数の組（極大1次独立部分組）を取り出す。
 * RREF のピボット列は、元の列（ベクトル）のうち1次独立な最大組に対応し、
 * ピボットでない列は、そのピボット列の1次結合として RREF の係数から直接読み取れる
 * （定理4.3.6: A と B=RREF(A) で列の1次関係が一致する）。
 */
export function extractMaximalIndependent(vectors: Fraction[][]): MaximalIndependentResult {
  const A = vectorsToMatrix(vectors);
  const { matrix, pivotCols } = rrefWithSteps(A);
  const pivotSet = new Set(pivotCols);
  const combinations = new Map<number, Fraction[]>();
  for (let j = 0; j < vectors.length; j++) {
    if (pivotSet.has(j)) continue;
    const coeff: Fraction[] = [];
    for (let pr = 0; pr < pivotCols.length; pr++) coeff.push(matrix[pr][j]);
    combinations.set(j, coeff);
  }
  return { rrefMatrix: matrix, pivotIndices: pivotCols, rank: pivotCols.length, combinations };
}

// --- 基底と座標（定理4.4.1, 4.4.5 関連） ---

export interface BasisCheck {
  isIndependent: boolean;
  spans: boolean; // rank(A) = 全体の次元 n と一致するか
  isBasis: boolean;
}

/** 基底かどうかの判定: (1) 1次独立 かつ (2) 全体を生成する（rank = 空間の次元）。 */
export function checkBasis(vectors: Fraction[][], spaceDim: number): BasisCheck {
  const A = vectorsToMatrix(vectors);
  const r = rank(A);
  const independent = r === vectors.length;
  const spans = r === spaceDim && vectors.length >= spaceDim;
  return { isIndependent: independent, spans, isBasis: independent && spans && vectors.length === spaceDim };
}

export type CoordinateResult = { ok: true; coeffs: Fraction[] } | { ok: false; reason: string };

/** x = c1 u1 + ... + cn un となる座標 (c1,...,cn) を求める（基底のときは一意）。 */
export function coordinates(basis: Fraction[][], x: Fraction[]): CoordinateResult {
  const A = vectorsToMatrix(basis);
  const n = numCols(A);
  const augmented: Mat = A.map((row, i) => [...row, x[i]]);
  const { matrix, pivotCols } = rrefWithSteps(augmented);
  const rows = matrix.length;
  for (let r = 0; r < rows; r++) {
    let allZero = true;
    for (let c = 0; c < n; c++) if (!matrix[r][c].isZero()) allZero = false;
    if (allZero && !matrix[r][n].isZero()) {
      return { ok: false, reason: "x はこの基底（ベクトルの組）の1次結合では表せません" };
    }
  }
  if (pivotCols.filter((c) => c < n).length < n) {
    return { ok: false, reason: "係数が一意に決まりません（ベクトルの組が1次独立ではない）" };
  }
  const coeffs: Fraction[] = new Array(n).fill(Fraction.zero());
  for (let pr = 0; pr < n; pr++) coeffs[pr] = matrix[pr][n];
  return { ok: true, coeffs };
}
