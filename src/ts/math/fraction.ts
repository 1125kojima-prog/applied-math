/**
 * 分数（有理数）クラス。
 *
 * なぜ必要か: 掃き出し法・ランク・解空間の計算を浮動小数点で行うと、
 * 0.1 + 0.2 のような誤差により「1次独立」を「1次従属」と誤判定する
 * 恐れがある（指示書 §3, §11）。そのため分子・分母の整数ペアで厳密に計算する。
 */
export class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: number | bigint, den: number | bigint = 1n) {
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

  private static gcdBig(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a === 0n ? 1n : a;
  }

  static fromInt(n: number | bigint): Fraction {
    return new Fraction(n, 1n);
  }

  static zero(): Fraction {
    return new Fraction(0n, 1n);
  }

  static one(): Fraction {
    return new Fraction(1n, 1n);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other: Fraction): Fraction {
    if (other.num === 0n) {
      throw new RangeError("Fraction: ゼロ除算です");
    }
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  equals(other: Fraction): boolean {
    return this.num === other.num && this.den === other.den;
  }

  lessThan(other: Fraction): boolean {
    return this.num * other.den < other.num * this.den;
  }

  abs(): Fraction {
    return this.num < 0n ? this.neg() : this;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  /** 表示用の文字列。分母が1なら整数のみ、それ以外は "分子/分母"（負号は分子側）。 */
  toString(): string {
    if (this.den === 1n) return this.num.toString();
    return `${this.num}/${this.den}`;
  }

  /** KaTeX 用の \frac 表記（整数はそのまま、分数は \dfrac{a}{b} 、負は先頭に -）。 */
  toLatex(): string {
    if (this.den === 1n) return this.num.toString();
    const negative = this.num < 0n;
    const n = negative ? -this.num : this.num;
    return `${negative ? "-" : ""}\\dfrac{${n}}{${this.den}}`;
  }
}

export function frac(num: number | bigint, den: number | bigint = 1): Fraction {
  return new Fraction(num, den);
}
