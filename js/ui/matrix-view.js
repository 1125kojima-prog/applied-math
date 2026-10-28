import { renderMath } from "./katex-loader.js";
export function renderMatrix(container, m, opts = {}) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "matrix-wrap";
    if (opts.caption)
        wrap.setAttribute("aria-label", opts.caption);
    const table = document.createElement("table");
    table.className = "mat";
    const highlightRows = new Set(opts.highlightRows ?? []);
    const pivotSet = new Set((opts.pivotCells ?? []).map((p) => `${p.row},${p.col}`));
    const tbody = document.createElement("tbody");
    m.forEach((row, ri) => {
        const tr = document.createElement("tr");
        if (highlightRows.has(ri))
            tr.classList.add("mat-row-highlight");
        row.forEach((cell, ci) => {
            const td = document.createElement("td");
            if (pivotSet.has(`${ri},${ci}`))
                td.classList.add("mat-pivot");
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
export function renderColumnVector(container, v, opts = {}) {
    renderMatrix(container, v.map((x) => [x]), opts);
}
//# sourceMappingURL=matrix-view.js.map