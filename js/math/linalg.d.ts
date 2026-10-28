/**
 * ベクトル・多項式の基本演算と、1次独立性・基底・座標・部分空間の判定に使う
 * 高レベルのヘルパー関数群。すべて Fraction ベースの厳密計算。
 */
import { Fraction } from "./fraction.js";
import { Mat } from "./matrix.js";
export declare function zeroVec(n: number): Fraction[];
export declare function vecAdd(a: Fraction[], b: Fraction[]): Fraction[];
export declare function vecSub(a: Fraction[], b: Fraction[]): Fraction[];
export declare function vecScale(c: Fraction, a: Fraction[]): Fraction[];
export declare function vecEquals(a: Fraction[], b: Fraction[]): boolean;
export declare function vecIsZero(a: Fraction[]): boolean;
export declare function polyEval(coeffs: Fraction[], x: Fraction): Fraction;
/** 係数ベクトルを KaTeX 用の多項式の文字列（例: "1 + x + 3x^2"）に変換する。 */
export declare function polyToLatex(coeffs: Fraction[]): string;
/** 多項式の導関数の係数ベクトル（同じ長さで、最高次の係数は0になる）。 */
export declare function polyDerivative(coeffs: Fraction[]): Fraction[];
export declare function vectorsToMatrix(vectors: Fraction[][]): Mat;
/** ベクトルの組が1次独立か（rank(A) = 本数）。 */
export declare function isIndependent(vectors: Fraction[][]): boolean;
/**
 * 1次従属なとき、非自明な係数 (c1,...,cn)（すべて0ではない）を1組返す。
 * A c = 0 の解空間（核）の基底の最初の1本を使う（定理4.2.1）。
 * 独立なときは null を返す。
 */
export declare function nontrivialDependency(vectors: Fraction[][]): Fraction[] | null;
export interface MaximalIndependentResult {
    rrefMatrix: Mat;
    pivotIndices: number[];
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
export declare function extractMaximalIndependent(vectors: Fraction[][]): MaximalIndependentResult;
export interface BasisCheck {
    isIndependent: boolean;
    spans: boolean;
    isBasis: boolean;
}
/** 基底かどうかの判定: (1) 1次独立 かつ (2) 全体を生成する（rank = 空間の次元）。 */
export declare function checkBasis(vectors: Fraction[][], spaceDim: number): BasisCheck;
export type CoordinateResult = {
    ok: true;
    coeffs: Fraction[];
} | {
    ok: false;
    reason: string;
};
/** x = c1 u1 + ... + cn un となる座標 (c1,...,cn) を求める（基底のときは一意）。 */
export declare function coordinates(basis: Fraction[][], x: Fraction[]): CoordinateResult;
