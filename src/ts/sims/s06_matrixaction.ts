/**
 * S06 行列とベクトルの組の対応（第4回 p.33）
 * (u1,...,um) A の列ごとの結果が、u1,...,umの1次結合であることを色分けで示す。
 */
import { Fraction, frac } from "../math/fraction.js";
import { vecAdd, vecScale, zeroVec } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { PALETTE } from "../ui/vector-canvas.js";

const COLORS = [PALETTE.blue, PALETTE.orange, PALETTE.green];

export function mountS06(container: HTMLElement): void {
  const refs = createSimLayout(container, {
    title: "行列とベクトルの組の対応",
    page: "p.33",
    lecture: "第4回",
    purpose: "ベクトルの組 (u1,…,um) と行列の積 (u1,…,um)A の関係を、色分けした式で理解する。",
  });

  let m = 2; // ベクトルの本数
  let n = 3; // 結果の本数（Aの列数）
  let dim = 2; // 各ベクトルの次元
  let vectors: Fraction[][] = [
    [frac(1), frac(2)],
    [frac(3), frac(1)],
  ];
  let A: Fraction[][] = [
    [frac(3), frac(2), frac(1)],
    [frac(1), frac(-1), frac(4)],
  ]; // m行 n列

  refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s06-m">ベクトルの本数 m</label><select id="s06-m">${[2, 3].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
      <label for="s06-n">結果の本数 n</label><select id="s06-n">${[2, 3].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s06-vectors"></div>
    <div id="s06-matrix"></div>
  `;
  const mSel = refs.operation.querySelector<HTMLSelectElement>("#s06-m")!;
  const nSel = refs.operation.querySelector<HTMLSelectElement>("#s06-n")!;
  mSel.value = String(m);
  nSel.value = String(n);
  const vectorsEl = refs.operation.querySelector<HTMLElement>("#s06-vectors")!;
  const matrixInputEl = refs.operation.querySelector<HTMLElement>("#s06-matrix")!;

  refs.display.innerHTML = `<div id="s06-formula"></div>`;
  const formulaEl = refs.display.querySelector<HTMLElement>("#s06-formula")!;

  function resize(): void {
    const newVectors: Fraction[][] = [];
    for (let i = 0; i < m; i++) {
      const v: Fraction[] = [];
      for (let k = 0; k < dim; k++) v.push(vectors[i]?.[k] ?? Fraction.zero());
      newVectors.push(v);
    }
    vectors = newVectors;
    const newA: Fraction[][] = [];
    for (let i = 0; i < m; i++) {
      const row: Fraction[] = [];
      for (let j = 0; j < n; j++) row.push(A[i]?.[j] ?? Fraction.zero());
      newA.push(row);
    }
    A = newA;
  }

  function buildInputs(): void {
    vectorsEl.innerHTML = vectors
      .map(
        (v, i) =>
          `<div class="field-row">
            <span class="legend-swatch" style="background:${COLORS[i % 3]}"></span>
            u${i + 1} = (${[0, 1]
            .map((k) => `<input type="number" class="s06-v" data-i="${i}" data-k="${k}" value="${v[k].toNumber()}" style="width:3.5em">`)
            .join(", ")})
          </div>`
      )
      .join("");
    vectorsEl.querySelectorAll<HTMLInputElement>(".s06-v").forEach((el) => {
      el.addEventListener("input", () => {
        const i = Number(el.dataset.i);
        const k = Number(el.dataset.k);
        vectors[i][k] = frac(Number(el.value) || 0);
        update();
      });
    });

    let rows = "<p>行列 A（m行 n列）:</p>";
    for (let i = 0; i < m; i++) {
      let cells = "";
      for (let j = 0; j < n; j++) {
        cells += `<input type="number" class="s06-a" data-i="${i}" data-j="${j}" value="${A[i][j].toNumber()}" style="width:3.5em">`;
      }
      rows += `<div class="field-row">${cells}</div>`;
    }
    matrixInputEl.innerHTML = rows;
    matrixInputEl.querySelectorAll<HTMLInputElement>(".s06-a").forEach((el) => {
      el.addEventListener("input", () => {
        const i = Number(el.dataset.i);
        const j = Number(el.dataset.j);
        A[i][j] = frac(Number(el.value) || 0);
        update();
      });
    });
  }

  function update(): void {
    let html = '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;font-size:1.1rem">';
    html += "(";
    vectors.forEach((_, i) => {
      if (i > 0) html += ", ";
      html += `<span style="color:${COLORS[i % 3]};font-weight:bold">u${i + 1}</span>`;
    });
    html += ") × A = (";
    for (let j = 0; j < n; j++) {
      if (j > 0) html += ", ";
      const terms: string[] = [];
      for (let i = 0; i < m; i++) {
        const coeff = A[i][j];
        if (coeff.isZero()) continue;
        const coeffStr = coeff.equals(Fraction.one()) ? "" : coeff.equals(Fraction.one().neg()) ? "-" : coeff.toString();
        terms.push(`<span style="color:${COLORS[i % 3]};font-weight:bold">${coeffStr}u${i + 1}</span>`);
      }
      html += terms.length > 0 ? terms.join(" + ").replace(/\+ -/g, "- ") : "0";
    }
    html += ")";
    html += "</div>";

    html += "<h4>数値での結果</h4><ul>";
    for (let j = 0; j < n; j++) {
      let acc = zeroVec(dim);
      for (let i = 0; i < m; i++) {
        acc = vecAdd(acc, vecScale(A[i][j], vectors[i]));
      }
      html += `<li>結果${j + 1} = (${acc.map((f) => f.toString()).join(", ")})</li>`;
    }
    html += "</ul>";
    formulaEl.innerHTML = html;
  }

  mSel.addEventListener("change", () => {
    m = Number(mSel.value);
    resize();
    buildInputs();
    update();
  });
  nSel.addEventListener("change", () => {
    n = Number(nSel.value);
    resize();
    buildInputs();
    update();
  });

  buildInputs();
  update();

  renderQuiz(refs.quiz, [
    {
      prompt: "(u1,u2) に行列Aの第1列 [3,1] を掛けると、結果はどうなりますか？",
      choices: ["3u1 + u2", "u1 + 3u2", "3u1 - u2"],
      correctIndex: 0,
      explanation: "第1列の成分がそれぞれu1,u2の係数になるので、3u1+1u2=3u1+u2です。",
    },
  ]);

  renderGlossary(refs.glossary, [
    { term: "(u1,…,um)A", def: "ベクトルの組を並べた「行列」とAの積。各列はu1,…,umの1次結合になる。" },
  ]);
}
