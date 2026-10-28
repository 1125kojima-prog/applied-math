/**
 * ライト/ダークテーマの切替。
 * 1) localStorage に保存された手動選択があればそれを使う
 * 2) なければ prefers-color-scheme に従う
 * 背景・文字色はすべて css/style.css の CSS変数（:root, [data-theme] ）で管理する。
 */
const STORAGE_KEY = "appliedmath-theme";
export function getStoredTheme() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === "light" || v === "dark" ? v : null;
    }
    catch {
        return null; // プライベートモードなどで localStorage が使えない場合
    }
}
export function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
}
export function setTheme(mode) {
    applyTheme(mode);
    try {
        localStorage.setItem(STORAGE_KEY, mode);
    }
    catch {
        // 保存できなくても表示自体は切り替わっているので無視する
    }
}
export function initTheme() {
    const stored = getStoredTheme();
    const mode = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(mode);
    return mode;
}
export function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
}
export function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//# sourceMappingURL=theme.js.map