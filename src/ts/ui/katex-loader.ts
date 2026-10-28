/**
 * KaTeX 数式表示のラッパー。
 * KaTeX は cdnjs から固定バージョンで読み込む（index.html 側）。
 * 読み込みに失敗した場合（オフライン等）は、生のテキストで代替表示する
 * ことでアプリ全体が壊れないようにする。
 */
declare global {
  interface Window {
    katex?: {
      render(expr: string, el: HTMLElement, opts?: Record<string, unknown>): void;
    };
  }
}

export function isKatexAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.katex !== "undefined";
}

/** 要素に LaTeX 数式を描画する。失敗時は素のテキストにフォールバックする。 */
export function renderMath(el: HTMLElement, latex: string, displayMode = false): void {
  if (isKatexAvailable()) {
    try {
      window.katex!.render(latex, el, { displayMode, throwOnError: false });
      return;
    } catch {
      // フォールスルーしてテキスト表示にする
    }
  }
  el.textContent = latex;
  el.classList.add("katex-fallback");
}

/** data-katex 属性を持つ要素をすべて描画する（属性値が LaTeX 文字列）。 */
export function renderAllMath(root: ParentNode = document): void {
  const nodes = root.querySelectorAll<HTMLElement>("[data-katex]");
  nodes.forEach((el) => {
    const latex = el.getAttribute("data-katex") ?? "";
    const display = el.getAttribute("data-katex-display") === "true";
    renderMath(el, latex, display);
  });
}
