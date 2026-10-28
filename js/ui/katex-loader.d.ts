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
export declare function isKatexAvailable(): boolean;
/** 要素に LaTeX 数式を描画する。失敗時は素のテキストにフォールバックする。 */
export declare function renderMath(el: HTMLElement, latex: string, displayMode?: boolean): void;
/** data-katex 属性を持つ要素をすべて描画する（属性値が LaTeX 文字列）。 */
export declare function renderAllMath(root?: ParentNode): void;
