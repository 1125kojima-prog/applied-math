export function isKatexAvailable() {
    return typeof window !== "undefined" && typeof window.katex !== "undefined";
}
/** 要素に LaTeX 数式を描画する。失敗時は素のテキストにフォールバックする。 */
export function renderMath(el, latex, displayMode = false) {
    if (isKatexAvailable()) {
        try {
            window.katex.render(latex, el, { displayMode, throwOnError: false });
            return;
        }
        catch {
            // フォールスルーしてテキスト表示にする
        }
    }
    el.textContent = latex;
    el.classList.add("katex-fallback");
}
/** data-katex 属性を持つ要素をすべて描画する（属性値が LaTeX 文字列）。 */
export function renderAllMath(root = document) {
    const nodes = root.querySelectorAll("[data-katex]");
    nodes.forEach((el) => {
        const latex = el.getAttribute("data-katex") ?? "";
        const display = el.getAttribute("data-katex-display") === "true";
        renderMath(el, latex, display);
    });
}
//# sourceMappingURL=katex-loader.js.map