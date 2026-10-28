/**
 * アプリのエントリーポイント。
 * テーマの初期化、目次（Nav）の構築、各シミュレーションの登録を行う。
 */
import { initTheme, setTheme, ThemeMode } from "./ui/theme.js";
import { Nav, SimEntry } from "./ui/nav.js";
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
const themeSelect = document.getElementById("theme-select") as HTMLSelectElement | null;
if (themeSelect) {
  themeSelect.value = mode;
  themeSelect.addEventListener("change", () => {
    setTheme(themeSelect.value as ThemeMode);
  });
}

const entries: SimEntry[] = [
  { id: "s01", title: "S01 部分空間の判定器", lecture: "第2回", page: "p.24-29", mount: mountS01 },
  { id: "s02", title: "S02 掃き出し法のステッパー", lecture: "事前学習2/第7回", page: "p.55", mount: mountS02 },
  { id: "s03", title: "S03 ベクトル空間の8条件チェッカー", lecture: "第1回", page: "p.21-22", mount: mountS03 },
  { id: "s04", title: "S04 1次独立・1次従属の判定", lecture: "第3・4回", page: "p.31-36", mount: mountS04 },
  { id: "s05", title: "S05 図で見る1次独立・1次従属", lecture: "第3・4回", page: "p.33-34", mount: mountS05 },
  { id: "s06", title: "S06 行列とベクトルの組の対応", lecture: "第4回", page: "p.33", mount: mountS06 },
  { id: "s07", title: "S07 ランク・極大1次独立部分組", lecture: "第5回", page: "p.43-44", mount: mountS07 },
  { id: "s08", title: "S08 行列のランク（列＝行）", lecture: "第5回", page: "p.44-46", mount: mountS08 },
  { id: "s09", title: "S09 基底と座標", lecture: "第6回", page: "p.51-56", mount: mountS09 },
  { id: "s10", title: "S10 次元の定義と基底の要素数", lecture: "第7回", page: "p.54,59-60", mount: mountS10 },
  { id: "s11", title: "S11 生成される部分空間の次元", lecture: "第7回", page: "p.59-60", mount: mountS11 },
  { id: "s12", title: "S12 多項式空間とグラフ", lecture: "第3・4・7回", page: "p.32,46", mount: mountS12 },
];

const navListEl = document.getElementById("nav-list");
const mainContentEl = document.getElementById("sim-container");

if (navListEl && mainContentEl) {
  const nav = new Nav(navListEl, mainContentEl, entries);
  nav.showFromHashOrFirst();
  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "");
    if (hash && hash !== nav.getCurrentId()) nav.show(hash);
  });
} else {
  console.error("ナビゲーションの初期化に失敗しました（要素が見つかりません）");
}
