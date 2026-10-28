/**
 * S08 行列のランク（列のランク=行のランク）（第5回 p.44-46）
 */
import { Fraction, frac } from "../math/fraction.js";
import { Mat, rref, rank, transpose } from "../math/matrix.js";
import { extractMaximalIndependent } from "../math/linalg.js";
import { createSimLayout, renderGlossary } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";

const DEFAULT_A = [
  [1, 1, 1, -2, -1],
  [1, 2, 3, -4, -4],
  [3, 0, -3, 1, 7],
  [0, -1, -2, -1, 0],
];

export function mountS08(container: HTMLElement): void {
  const refs = createSimLayout(container, {
    title: "S08 行列のランク（列のランク＝行のランク）",
    page: "p.44-46",
    lecture: "第5回",
    purpose: "rank(A) = 列の最大独立数 = 行の最大独立数 であることを確認する。",
    theorems: [
      { id: "定理4.3.3", text: "rank(A) = 列ベクトルの1次独立な最大個数 = 行ベクトルの1次独立な最大個数", page: "p.44" },
      { id: "定理4.3.4", text: "n次正方行列: 正則 ⇔ n列が1次独立 ⇔ n行が1次独立", page: "p.45" },
    ],
  });

  let m = 4;
  let n = 5;
  let A: Fraction[][] = DEFAULT_A.map((row) => row.map((x) => frac(x)));

  refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s08-m">行数 m</label><select id="s08-m">${[2, 3, 4].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
      <label for="s08-n">列数 n</label><select id="s08-n">${[2, 3, 4, 5].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s08-grid"></div>
    <div class="field-row">
      <button type="button" id="s08-default">例題4.3.1/4.3.2の係数行列を使う</button>
      <button type="button" id="s08-transpose">転置する</button>
      <button type="button" id="s08-run">計算する</button>
    </div>
  `;
  const mSel = refs.operation.querySelector<HTMLSelectElement>("#s08-m")!;
  const nSel = refs.operation.querySelector<HTMLSelectElement>("#s08-n")!;
  mSel.value = String(m);
  nSel.value = String(n);
  const gridEl = refs.operation.querySelector<HTMLElement>("#s08-grid")!;

  refs.display.innerHTML = `<div id="s08-result"></div>`;
  const resultEl = refs.display.querySelector<HTMLElement>("#s08-result")!;

  function buildGrid(): void {
    let html = "";
    for (let i = 0; i < m; i++) {
      let cells = "";
      for (let j = 0; j < n; j++) {
        const val = A[i]?.[j]?.toNumber() ?? 0;
        cells += `<input type="number" class="s08-cell" data-row="${i}" data-col="${j}" value="${val}" style="width:3.5em">`;
      }
      html += `<div class="field-row">${cells}</div>`;
    }
    gridEl.innerHTML = html;
    gridEl.querySelectorAll<HTMLInputElement>(".s08-cell").forEach((el) => {
      el.addEventListener("input", () => {
        const i = Number(el.dataset.row);
        const j = Number(el.dataset.col);
        A[i][j] = frac(Number(el.value) || 0);
      });
    });
  }

  function resize(): void {
    const newA: Fraction[][] = [];
    for (let i = 0; i < m; i++) {
      const row: Fraction[] = [];
      for (let j = 0; j < n; j++) row.push(A[i]?.[j] ?? Fraction.zero());
      newA.push(row);
    }
    A = newA;
  }

  function run(): void {
    const columns: Fraction[][] = [];
    for (let j = 0; j < n; j++) columns.push(A.map((row) => row[j]));
    const rows: Fraction[][] = A.map((row) => row.slice());

    const colExtract = extractMaximalIndependent(columns);
    const rowExtract = extractMaximalIndependent(rows);
    const r = rank(A as Mat);

    resultEl.innerHTML = "";
    const rrefHost = document.createElement("div");
    rrefHost.innerHTML = "<h4>A の簡約行基本形（RREF）</h4>";
    renderMatrix(rrefHost, rref(A as Mat));
    resultEl.appendChild(rrefHost);

    const colHost = document.createElement("p");
    colHost.textContent = `列の最大独立数: ${colExtract.rank}（第${colExtract.pivotIndices.map((c) => c + 1).join(", ")}列）`;
    resultEl.appendChild(colHost);

    const rowHost = document.createElement("p");
    rowHost.textContent = `行の最大独立数: ${rowExtract.rank}（第${rowExtract.pivotIndices.map((c) => c + 1).join(", ")}行）`;
    resultEl.appendChild(rowHost);
    const note = document.createElement("p");
    note.textContent = "既定値は例題4.3.1/4.3.2（p.43,46）と同じ係数行列（列 = a1..a5 / f1..f5 の係数ベクトル）です。";
    resultEl.appendChild(note);

    const match = colExtract.rank === rowExtract.rank && colExtract.rank === r;
    renderBadge(resultEl, {
      verdict: match ? "yes" : "no",
      title: `列のランク = 行のランク = rank(A) = ${r}`,
      reason: match ? "列・行どちらから数えても同じ値になりました（定理4.3.3）。" : "一致しませんでした。実装を確認してください（要確認）。",
    });

    if (m === n) {
      const regular = r === n;
      const regHost = document.createElement("p");
      regHost.textContent = regular
        ? `正方行列（${n}×${n}）で rank=${n}=n なので正則です（定理4.3.4: 列も行も1次独立）。`
        : `正方行列（${n}×${n}）で rank=${r}<n なので正則ではありません。`;
      resultEl.appendChild(regHost);
    }
  }

  mSel.addEventListener("change", () => {
    m = Number(mSel.value);
    resize();
    buildGrid();
  });
  nSel.addEventListener("change", () => {
    n = Number(nSel.value);
    resize();
    buildGrid();
  });
  refs.operation.querySelector<HTMLButtonElement>("#s08-default")!.addEventListener("click", () => {
    m = 4;
    n = 5;
    mSel.value = "4";
    nSel.value = "5";
    A = DEFAULT_A.map((row) => row.map((x) => frac(x)));
    buildGrid();
  });
  refs.operation.querySelector<HTMLButtonElement>("#s08-transpose")!.addEventListener("click", () => {
    const t = transpose(A as Mat);
    A = t;
    [m, n] = [n, m];
    mSel.value = String(m);
    nSel.value = String(n);
    buildGrid();
  });
  refs.operation.querySelector<HTMLButtonElement>("#s08-run")!.addEventListener("click", run);

  buildGrid();
  run();

  renderGlossary(refs.glossary, [
    { term: "正則行列", def: "逆行列を持つ正方行列。n次正方行列ではrank=nと同値。" },
  ]);
}
