/**
 * S07 ランク・極大1次独立部分組（第5回 p.43-44）— 最重要
 * 例題4.3.1（PDF確認済み: a1=(1,1,3,0), a2=(1,2,0,-1), a3=(1,3,-3,-2),
 * a4=(-2,-4,1,-1), a5=(-1,-4,7,0)。rank=3、基底{a1,a2,a4}、
 * a3=-a1+2a2, a5=2a1-a2+a4）を既定値とする。
 */
import { Fraction, frac } from "../math/fraction.js";
import { Mat, rrefWithSteps, vectorsAsColumns } from "../math/matrix.js";
import { extractMaximalIndependent, vecAdd, vecScale, zeroVec } from "../math/linalg.js";
import { createSimLayout, renderGlossary } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";
import { Stepper } from "../ui/stepper.js";

const DEFAULT_VECTORS = [
  [1, 1, 3, 0],
  [1, 2, 0, -1],
  [1, 3, -3, -2],
  [-2, -4, 1, -1],
  [-1, -4, 7, 0],
];

export function mountS07(container: HTMLElement): void {
  const refs = createSimLayout(container, {
    title: "S07 ランク・極大1次独立部分組",
    page: "p.43-44",
    lecture: "第5回",
    purpose: "例題4.3.1のアルゴリズム（簡約化→極大独立組の特定→残りの1次結合表現）をステップで追う。",
    theorems: [
      { id: "定理4.3.3", text: "rank(A) = 列ベクトルの1次独立な最大個数 = 行ベクトルの1次独立な最大個数", page: "p.44" },
      { id: "定理4.3.6", text: "A と B=RREF(A) で、列の1次関係は一致する", page: "p.45" },
    ],
  });

  let n = 5; // ベクトルの本数
  let dim = 4; // 次元
  let vectors: Fraction[][] = DEFAULT_VECTORS.map((v) => v.map((x) => frac(x)));

  refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s07-n">本数</label><select id="s07-n">${[2, 3, 4, 5].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
      <label for="s07-dim">次元</label><select id="s07-dim">${[2, 3, 4, 5].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s07-grid"></div>
    <div class="field-row">
      <button type="button" id="s07-default">例題4.3.1の値を使う</button>
      <button type="button" id="s07-run">計算する</button>
    </div>
    <div class="stepper-bar">
      <button type="button" id="s07-step1">Step 1</button>
      <button type="button" id="s07-step2">Step 2</button>
      <button type="button" id="s07-step3">Step 3</button>
      <button type="button" id="s07-step4">Step 4</button>
    </div>
  `;
  const nSel = refs.operation.querySelector<HTMLSelectElement>("#s07-n")!;
  const dimSel = refs.operation.querySelector<HTMLSelectElement>("#s07-dim")!;
  nSel.value = String(n);
  dimSel.value = String(dim);
  const gridEl = refs.operation.querySelector<HTMLElement>("#s07-grid")!;

  refs.display.innerHTML = `<div id="s07-panel"></div>`;
  const panelEl = refs.display.querySelector<HTMLElement>("#s07-panel")!;

  function buildGrid(): void {
    let html = "";
    for (let j = 0; j < n; j++) {
      let cells = "";
      for (let i = 0; i < dim; i++) {
        const val = vectors[j]?.[i]?.toNumber() ?? 0;
        cells += `<input type="number" class="s07-cell" data-col="${j}" data-row="${i}" value="${val}" style="width:3.5em">`;
      }
      html += `<div class="field-row">a${j + 1} = (${cells})</div>`;
    }
    gridEl.innerHTML = html;
    gridEl.querySelectorAll<HTMLInputElement>(".s07-cell").forEach((el) => {
      el.addEventListener("input", () => {
        const col = Number(el.dataset.col);
        const row = Number(el.dataset.row);
        vectors[col][row] = frac(Number(el.value) || 0);
      });
    });
  }

  function resize(): void {
    const newVectors: Fraction[][] = [];
    for (let j = 0; j < n; j++) {
      const v: Fraction[] = [];
      for (let i = 0; i < dim; i++) v.push(vectors[j]?.[i] ?? Fraction.zero());
      newVectors.push(v);
    }
    vectors = newVectors;
  }

  let currentStep = 1;

  function run(): void {
    currentStep = 1;
    renderStep();
  }

  function renderStep(): void {
    const A: Mat = vectorsAsColumns(vectors);
    const extraction = extractMaximalIndependent(vectors);
    panelEl.innerHTML = "";

    if (currentStep === 1) {
      const h = document.createElement("h4");
      h.textContent = "Step 1: A を簡約化して B を得る";
      panelEl.appendChild(h);
      const stepperHost = document.createElement("div");
      const descHost = document.createElement("div");
      descHost.className = "step-description";
      const matHost = document.createElement("div");
      panelEl.appendChild(descHost);
      panelEl.appendChild(matHost);
      panelEl.appendChild(stepperHost);

      const { steps, pivotCols } = rrefWithSteps(A);
      const displaySteps = [{ matrix: A, description: "初期状態 A", highlightRows: [] as number[] }];
      for (const s of steps) displaySteps.push({ matrix: s.matrixAfter, description: s.description, highlightRows: s.highlightRows });

      new Stepper(stepperHost, displaySteps.length, {
        onStepChange: (index) => {
          const step = displaySteps[index];
          descHost.textContent = step.description;
          const isLast = index === displaySteps.length - 1;
          renderMatrix(matHost, step.matrix, {
            highlightRows: step.highlightRows,
            pivotCells: isLast ? pivotCols.map((col, row) => ({ row, col })) : [],
          });
        },
      });
    } else if (currentStep === 2) {
      const h = document.createElement("h4");
      h.textContent = "Step 2: B のピボット列から、極大1次独立組を特定する";
      panelEl.appendChild(h);
      renderMatrix(panelEl, extraction.rrefMatrix, {
        pivotCells: extraction.pivotIndices.map((col, row) => ({ row, col })),
      });
      const p = document.createElement("p");
      p.textContent = `ピボットは第${extraction.pivotIndices.map((c) => c + 1).join(", ")}列 → これに対応する a${extraction.pivotIndices
        .map((c) => c + 1)
        .join(", a")} が1次独立な極大組です。`;
      panelEl.appendChild(p);
      renderBadge(panelEl, { verdict: "yes", title: `極大1次独立組: {${extraction.pivotIndices.map((c) => `a${c + 1}`).join(", ")}}`, reason: `rank(A) = ${extraction.rank} 本です。` });
    } else if (currentStep === 3) {
      const h = document.createElement("h4");
      h.textContent = "Step 3: 残りの列を、極大独立組の1次結合で表す";
      panelEl.appendChild(h);
      if (extraction.combinations.size === 0) {
        panelEl.appendChild(document.createElement("p")).textContent = "すべての列がピボット列（1次独立）のため、表すべき残りの列はありません。";
      }
      extraction.combinations.forEach((coeffs, j) => {
        const terms = coeffs
          .map((c, k) => {
            const pivotLabel = `a${extraction.pivotIndices[k] + 1}`;
            if (c.isZero()) return null;
            const s = c.equals(Fraction.one()) ? pivotLabel : c.equals(Fraction.one().neg()) ? `-${pivotLabel}` : `${c.toString()}${pivotLabel}`;
            return s;
          })
          .filter((s): s is string => s !== null)
          .join(" + ")
          .replace(/\+ -/g, "- ");
        const p = document.createElement("p");
        p.textContent = `a${j + 1} = ${terms || "0"}`;
        panelEl.appendChild(p);
      });
    } else {
      const h = document.createElement("h4");
      h.textContent = "Step 4: A の列の関係と B の列の関係が一致することの確認（定理4.3.6）";
      panelEl.appendChild(h);
      extraction.combinations.forEach((coeffs, j) => {
        let acc = zeroVec(dim);
        extraction.pivotIndices.forEach((pIdx, k) => {
          acc = vecAdd(acc, vecScale(coeffs[k], vectors[pIdx]));
        });
        const matches = acc.every((x, i) => x.equals(vectors[j][i]));
        const p = document.createElement("p");
        p.textContent = `Bから読み取った係数で a${j + 1} を計算: (${acc.map((x) => x.toString()).join(", ")}) ${
          matches ? "= 元の a" + (j + 1) + " と一致 ✓" : "≠ 元の値（要確認）"
        }`;
        panelEl.appendChild(p);
      });
      renderBadge(panelEl, {
        verdict: "yes",
        title: `rank(A) = ${extraction.rank}`,
        reason: "極大1次独立組の要素数と一致します（定理4.3.3）。",
      });
    }
  }

  nSel.addEventListener("change", () => {
    n = Number(nSel.value);
    resize();
    buildGrid();
  });
  dimSel.addEventListener("change", () => {
    dim = Number(dimSel.value);
    resize();
    buildGrid();
  });
  refs.operation.querySelector<HTMLButtonElement>("#s07-default")!.addEventListener("click", () => {
    n = 5;
    dim = 4;
    nSel.value = "5";
    dimSel.value = "4";
    vectors = DEFAULT_VECTORS.map((v) => v.map((x) => frac(x)));
    buildGrid();
  });
  refs.operation.querySelector<HTMLButtonElement>("#s07-run")!.addEventListener("click", run);
  (["1", "2", "3", "4"] as const).forEach((s) => {
    refs.operation.querySelector<HTMLButtonElement>(`#s07-step${s}`)!.addEventListener("click", () => {
      currentStep = Number(s);
      renderStep();
    });
  });

  buildGrid();
  run();

  renderGlossary(refs.glossary, [
    { term: "極大1次独立部分組", def: "ベクトルの組の中で、1次独立な最大個数を実現する部分組。" },
    { term: "rank(A)", def: "行列Aの列（または行）の1次独立な最大個数。" },
  ]);
}
