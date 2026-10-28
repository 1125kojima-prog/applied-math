/**
 * 行列を「左右に括弧付き」で表示する共通コンポーネント（指示書 §4.4）。
 * ピボット（主成分）は太枠＋色、変形した行はハイライトして表示する。
 */
import { Fraction } from "../math/fraction.js";
import { renderMath } from "./katex-loader.js";

export interface MatrixViewOptions {
  highlightRows?: number[];
  pivotCells?: Array<{ row: number; col: number }>;
  augmentedAfterCol?: number; // この列の直後に縦線を引く（拡大係数行列 [A|b] 用）
  caption?: string;
}

export function renderMatrix(container: HTMLElement, m: Fraction[][], opts: MatrixViewOptions = {}): void {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "matrix-wrap";
  if (opts.caption) wrap.setAttribute("aria-label", opts.caption);

  const table = document.createElement("table");
  table.className = "mat";
  const highlightRows = new Set(opts.highlightRows ?? []);
  const pivotSet = new Set((opts.pivotCells ?? []).map((p) => `${p.row},${p.col}`));

  const tbody = document.createElement("tbody");
  m.forEach((row, ri) => {
    const tr = document.createElement("tr");
    if (highlightRows.has(ri)) tr.classList.add("mat-row-highlight");
    row.forEach((cell, ci) => {
      const td = document.createElement("td");
      if (pivotSet.has(`${ri},${ci}`)) td.classList.add("mat-pivot");
      if (opts.augmentedAfterCol !== undefined && ci === opts.augmentedAfterCol) {
        td.classList.add("mat-aug-divider");
      }
      const span = document.createElement("span");
      renderMath(span, cell.toLatex());
      td.appendChild(span);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);
}

/** ベクトル（縦ベクトル1列の行列として）を表示する簡易ヘルパー。 */
export function renderColumnVector(container: HTMLElement, v: Fraction[], opts: MatrixViewOptions = {}): void {
  renderMatrix(container, v.map((x) => [x]), opts);
}
