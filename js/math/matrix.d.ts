/**
 * 行列演算（分数ベース）。
 *
 * 掃き出し法（Gauss-Jordan 法）で簡約行基本形（RREF）を求め、
 * そこからランク・解の種類・解空間の基底・自由変数を導く。
 * すべて Fraction で計算するため、浮動小数点誤差による誤判定が起きない。
 */
import { Fraction } from "./fraction.js";
export type Mat = Fraction[][];
export declare function cloneMat(a: Mat): Mat;
export declare function matFromInts(rows: number[][]): Mat;
/** ベクトルの配列（各要素が1本の列ベクトル）を、それらを列とする行列に変換する。 */
export declare function vectorsAsColumns(vectors: Fraction[][]): Mat;
export declare function numRows(a: Mat): number;
export declare function numCols(a: Mat): number;
/** 基本変形の種類。S02/S07 のステッパー表示に使う。 */
export type RowOp = {
    kind: "scale";
    row: number;
    factor: Fraction;
} | {
    kind: "swap";
    rowA: number;
    rowB: number;
} | {
    kind: "addMultiple";
    target: number;
    source: number;
    factor: Fraction;
};
export interface RrefStep {
    op: RowOp;
    description: string;
    matrixAfter: Mat;
    highlightRows: number[];
}
export interface RrefResult {
    matrix: Mat;
    steps: RrefStep[];
    pivotCols: number[];
}
/**
 * 簡約行基本形（RREF）を求め、各ステップを記録する。
 * 列数は augmented（拡大係数行列）であっても良い。全列を対象に簡約する。
 */
export declare function rrefWithSteps(input: Mat): RrefResult;
export declare function rref(input: Mat): Mat;
/** 行列のランク（= 簡約化後の非ゼロ行数 = ピボット数）。 */
export declare function rank(input: Mat): number;
/** 行列の転置。 */
export declare function transpose(a: Mat): Mat;
export interface NullspaceResult {
    basis: Fraction[][];
    freeCols: number[];
    pivotCols: number[];
}
/**
 * 同次連立方程式 A x = 0 の解空間（核）の基底を求める（定理4.4.3 関連）。
 * RREF の主成分のない列（自由変数）ごとに、その変数を1、他の自由変数を0とおいて
 * 主成分の値を逆算することで基底ベクトルを1本ずつ作る。
 */
export declare function nullspace(a: Mat): NullspaceResult;
export type SolveResult = {
    type: "unique";
    solution: Fraction[];
} | {
    type: "infinite";
    particular: Fraction[];
    basis: Fraction[][];
    freeCols: number[];
} | {
    type: "none";
};
/**
 * 連立一次方程式 A x = b を解く。拡大係数行列 [A|b] を RREF にし、
 * 「0 = 非ゼロ」の行があれば解なし、自由変数があれば不定解とする（定理4.4.3）。
 */
export declare function solveLinear(a: Mat, b: Fraction[]): SolveResult;
/** 行列積 A × B。 */
export declare function matMul(a: Mat, b: Mat): Mat;
/** 2×2 行列式。 */
export declare function det2(u1: Fraction[], u2: Fraction[]): Fraction;
/** 3×3 行列式（列ベクトル3本から、サラスの公式）。 */
export declare function det3(a: Fraction[], b: Fraction[], c: Fraction[]): Fraction;
