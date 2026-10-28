/**
 * 分数（有理数）クラス。
 *
 * なぜ必要か: 掃き出し法・ランク・解空間の計算を浮動小数点で行うと、
 * 0.1 + 0.2 のような誤差により「1次独立」を「1次従属」と誤判定する
 * 恐れがある（指示書 §3, §11）。そのため分子・分母の整数ペアで厳密に計算する。
 */
export class Fraction {
    constructor(num, den = 1n) {
        let n = typeof num === "bigint" ? num : BigInt(Math.trunc(num));
        let d = typeof den === "bigint" ? den : BigInt(Math.trunc(den));
        if (d === 0n) {
            throw new RangeError("Fraction: 分母を0にすることはできません（ゼロ除算）");
        }
        // 符号は分子に寄せる
        if (d < 0n) {
            n = -n;
            d = -d;
        }
        const g = Fraction.gcdBig(n < 0n ? -n : n, d);
        if (g !== 0n) {
            n = n / g;
            d = d / g;
        }
        this.num = n;
        this.den = d;
    }
    static gcdBig(a, b) {
        a = a < 0n ? -a : a;
        b = b < 0n ? -b : b;
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a === 0n ? 1n : a;
    }
    static fromInt(n) {
        return new Fraction(n, 1n);
    }
    static zero() {
        return new Fraction(0n, 1n);
    }
    static one() {
        return new Fraction(1n, 1n);
    }
    add(other) {
        return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
    }
    sub(other) {
        return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
    }
    mul(other) {
        return new Fraction(this.num * other.num, this.den * other.den);
    }
    div(other) {
        if (other.num === 0n) {
            throw new RangeError("Fraction: ゼロ除算です");
        }
        return new Fraction(this.num * other.den, this.den * other.num);
    }
    neg() {
        return new Fraction(-this.num, this.den);
    }
    isZero() {
        return this.num === 0n;
    }
    equals(other) {
        return this.num === other.num && this.den === other.den;
    }
    lessThan(other) {
        return this.num * other.den < other.num * this.den;
    }
    abs() {
        return this.num < 0n ? this.neg() : this;
    }
    toNumber() {
        return Number(this.num) / Number(this.den);
    }
    /** 表示用の文字列。分母が1なら整数のみ、それ以外は "分子/分母"（負号は分子側）。 */
    toString() {
        if (this.den === 1n)
            return this.num.toString();
        return `${this.num}/${this.den}`;
    }
    /** KaTeX 用の \frac 表記（整数はそのまま、分数は \dfrac{a}{b} 、負は先頭に -）。 */
    toLatex() {
        if (this.den === 1n)
            return this.num.toString();
        const negative = this.num < 0n;
        const n = negative ? -this.num : this.num;
        return `${negative ? "-" : ""}\\dfrac{${n}}{${this.den}}`;
    }
}
export function frac(num, den = 1) {
    return new Fraction(num, den);
}
//# sourceMappingURL=fraction.js.map