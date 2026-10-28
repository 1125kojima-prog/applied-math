/**
 * アプリのエントリーポイント。
 * テーマの初期化、目次（第1回〜第7回のページ）の構築、各シミュレーションの
 * 講義回への割り当てを行う。1つのシミュレーションが複数の講義回にまたがる
 * 場合（例: 第3回と第4回の両方で使うもの）は、対応するすべてのページに表示する。
 */
import { initTheme, setTheme } from "./ui/theme.js";
import { Nav } from "./ui/nav.js";
import { mountS01 } from "./sims/s01_subspace.js";
import { mountS02 } from "./sims/s02_gauss.js";
import { mountS03 } from "./sims/s03_vectorspace.js";
import { mountS04 } from "./sims/s04_independence.js";
import { mountS05 } from "./sims/s05_geometry.js";
import { mountS06 } from "./sims/s06_matrixaction.js";
import { mountS07 } from "./sims/s07_rank_maximal.js";
import { mountS08 } from "./sims/s08_rank_rowcol.js";
import { mountS09 } from "./sims/s09_basis_coords.js";
import { mountS10 } from "./sims/s10_dimension.js";
import { mountS11 } from "./sims/s11_span_dimension.js";
import { mountS12 } from "./sims/s12_polynomial.js";
const mode = initTheme();
const themeSelect = document.getElementById("theme-select");
if (themeSelect) {
    themeSelect.value = mode;
    themeSelect.addEventListener("change", () => {
        setTheme(themeSelect.value);
    });
}
const SIMS = {
    s01: { id: "s01", mount: mountS01 },
    s02: { id: "s02", mount: mountS02 },
    s03: { id: "s03", mount: mountS03 },
    s04: { id: "s04", mount: mountS04 },
    s05: { id: "s05", mount: mountS05 },
    s06: { id: "s06", mount: mountS06 },
    s07: { id: "s07", mount: mountS07 },
    s08: { id: "s08", mount: mountS08 },
    s09: { id: "s09", mount: mountS09 },
    s10: { id: "s10", mount: mountS10 },
    s11: { id: "s11", mount: mountS11 },
    s12: { id: "s12", mount: mountS12 },
};
const ROUND_DEFS = [
    { id: "round1", title: "第1回", pdfFile: "01.pdf", pageRange: "p.21-23", simIds: ["s03"] },
    { id: "round2", title: "第2回", pdfFile: "02.pdf", pageRange: "p.24-30", simIds: ["s01"] },
    { id: "round3", title: "第3回", pdfFile: "03.pdf", pageRange: "p.31-33", simIds: ["s04", "s05", "s12"] },
    { id: "round4", title: "第4回", pdfFile: "04.pdf", pageRange: "p.34-40", simIds: ["s04", "s05", "s06", "s12"] },
    { id: "round5", title: "第5回", pdfFile: "05.pdf", pageRange: "p.41-50", simIds: ["s07", "s08"] },
    { id: "round6", title: "第6回", pdfFile: "06.pdf", pageRange: "p.51-58", simIds: ["s09"] },
    { id: "round7", title: "第7回", pdfFile: "07.pdf", pageRange: "p.59-63", simIds: ["s02", "s10", "s11", "s12"] },
];
const pages = ROUND_DEFS.map((r) => ({
    id: r.id,
    title: r.title,
    pdfFile: r.pdfFile,
    pageRange: r.pageRange,
    sims: r.simIds.map((simId) => SIMS[simId]),
}));
const navListEl = document.getElementById("nav-list");
const mainContentEl = document.getElementById("sim-container");
if (navListEl && mainContentEl) {
    const nav = new Nav(navListEl, mainContentEl, pages);
    nav.showFromHashOrFirst();
    window.addEventListener("hashchange", () => {
        const hash = location.hash.replace("#", "");
        if (hash && hash !== nav.getCurrentId())
            nav.show(hash);
    });
}
else {
    console.error("ナビゲーションの初期化に失敗しました（要素が見つかりません）");
}
//# sourceMappingURL=main.js.map