/**
 * 分数（有理数）クラス。
 *
 * なぜ必要か: 掃き出し法・ランク・解空間の計算を浮動小数点で行うと、
 * 0.1 + 0.2 のような誤差により「1次独立」を「1次従属」と誤判定する
 * 恐れがある（指示書 §3, §11）。そのため分子・分母の整数ペアで厳密に計算する。
 */
export declare class Fraction {
    readonly num: bigint;
    readonly den: bigint;
    constructor(num: number | bigint, den?: number | bigint);
    private static gcdBig;
    static fromInt(n: number | bigint): Fraction;
    static zero(): Fraction;
    static one(): Fraction;
    add(other: Fraction): Fraction;
    sub(other: Fraction): Fraction;
    mul(other: Fraction): Fraction;
    div(other: Fraction): Fraction;
    neg(): Fraction;
    isZero(): boolean;
    equals(other: Fraction): boolean;
    lessThan(other: Fraction): boolean;
    abs(): Fraction;
    toNumber(): number;
    /** 表示用の文字列。分母が1なら整数のみ、それ以外は "分子/分母"（負号は分子側）。 */
    toString(): string;
    /** KaTeX 用の \frac 表記（整数はそのまま、分数は \dfrac{a}{b} 、負は先頭に -）。 */
    toLatex(): string;
}
export declare function frac(num: number | bigint, den?: number | bigint): Fraction;
