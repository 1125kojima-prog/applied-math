/**
 * S04 1次独立・1次従属の判定（第3回 p.31-33、第4回 p.34-36）
 */
import { Fraction, frac } from "../math/fraction.js";
import { rrefWithSteps, vectorsAsColumns } from "../math/matrix.js";
import { isIndependent, nontrivialDependency } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";
import { Stepper } from "../ui/stepper.js";
const PRESETS = [
    { label: "標準基底 e1,e2,e3（R³）", m: 3, n: 3, vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
    {
        label: "第3回の例 u1=(1,1,0), u2=(0,1,1), u3=(1,2,1)",
        m: 3,
        n: 3,
        vectors: [[1, 1, 0], [0, 1, 1], [1, 2, 1]],
    },
];
export function mountS04(container) {
    const refs = createSimLayout(container, {
        title: "S04 1次独立・1次従属の判定",
        page: "p.31-33, p.34-36",
        lecture: "第3回・第4回",
        purpose: "ベクトルの組が1次独立か1次従属かを、Ac=0の非自明解の有無で判定する。",
        theorems: [
            { id: "定理4.2.1", text: "1次従属 ⇔ いずれかのベクトルが他の1次結合で書ける", page: "p.32" },
            { id: "定理4.2.3", text: "本数nが次元mより多いなら、n個は必ず1次従属", page: "p.34" },
        ],
    });
    let m = 3;
    let n = 3;
    let vectors = PRESETS[1].vectors.map((v) => v.map((x) => frac(x)));
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s04-preset">例を選ぶ:</label>
      <select id="s04-preset">${PRESETS.map((p, i) => `<option value="${i}">${p.label}</option>`).join("")}<option value="custom">カスタム入力</option></select>
    </div>
    <div class="field-row">
      <label for="s04-m">次元 m</label><select id="s04-m">${[2, 3].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
      <label for="s04-n">本数 n</label><select id="s04-n">${[1, 2, 3, 4].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s04-grid"></div>
    <button type="button" id="s04-run">判定する</button>
    <div id="s04-stepper"></div>
  `;
    const presetSel = refs.operation.querySelector("#s04-preset");
    const mSel = refs.operation.querySelector("#s04-m");
    const nSel = refs.operation.querySelector("#s04-n");
    const gridEl = refs.operation.querySelector("#s04-grid");
    const stepperEl = refs.operation.querySelector("#s04-stepper");
    mSel.value = String(m);
    nSel.value = String(n);
    refs.display.innerHTML = `
    <div id="s04-step-desc" class="step-description" aria-live="polite"></div>
    <div id="s04-matrix"></div>
    <div id="s04-badge"></div>
    <div id="s04-note"></div>
  `;
    const stepDescEl = refs.display.querySelector("#s04-step-desc");
    const matrixEl = refs.display.querySelector("#s04-matrix");
    const badgeEl = refs.display.querySelector("#s04-badge");
    const noteEl = refs.display.querySelector("#s04-note");
    function buildGrid() {
        let html = "";
        for (let j = 0; j < n; j++) {
            let cells = "";
            for (let i = 0; i < m; i++) {
                const val = vectors[j]?.[i]?.toNumber() ?? 0;
                cells += `<input type="number" class="s04-cell" data-col="${j}" data-row="${i}" value="${val}" style="width:3.5em" aria-label="v${j + 1}の第${i + 1}成分">`;
            }
            html += `<div class="field-row">v${j + 1} = (${cells})</div>`;
        }
        gridEl.innerHTML = html;
        gridEl.querySelectorAll(".s04-cell").forEach((el) => {
            el.addEventListener("input", () => {
                const col = Number(el.dataset.col);
                const row = Number(el.dataset.row);
                if (!vectors[col])
                    vectors[col] = new Array(m).fill(Fraction.zero());
                vectors[col][row] = frac(Number(el.value) || 0);
            });
        });
    }
    function resetVectorsForDims() {
        const newVectors = [];
        for (let j = 0; j < n; j++) {
            const v = [];
            for (let i = 0; i < m; i++)
                v.push(vectors[j]?.[i] ?? Fraction.zero());
            newVectors.push(v);
        }
        vectors = newVectors;
    }
    function run() {
        const A = vectorsAsColumns(vectors);
        const { steps, pivotCols } = rrefWithSteps(A);
        const displaySteps = [{ matrix: A, description: "初期状態 A=[v1 v2 … vn]", highlightRows: [] }];
        for (const s of steps)
            displaySteps.push({ matrix: s.matrixAfter, description: s.description, highlightRows: s.highlightRows });
        new Stepper(stepperEl, displaySteps.length, {
            onStepChange: (index) => {
                const step = displaySteps[index];
                stepDescEl.textContent = step.description;
                const isLast = index === displaySteps.length - 1;
                renderMatrix(matrixEl, step.matrix, {
                    highlightRows: step.highlightRows,
                    pivotCells: isLast ? pivotCols.map((col, row) => ({ row, col })) : [],
                });
                if (isLast)
                    renderFinal();
            },
        });
    }
    function renderFinal() {
        const independent = isIndependent(vectors);
        noteEl.innerHTML = "";
        if (independent) {
            renderBadge(badgeEl, {
                verdict: "yes",
                title: "1次独立",
                reason: `rank(A) = ${vectors.length} = 本数 なので、Ac=0 は自明解 c=0 しか持ちません。`,
            });
        }
        else {
            const dep = nontrivialDependency(vectors);
            const coeffStr = dep ? dep.map((f, i) => `(${f.toString()})·v${i + 1}`).join(" + ") + " = 0" : "";
            renderBadge(badgeEl, {
                verdict: "no",
                title: "1次従属",
                reason: `rank(A) < 本数 なので、Ac=0 に非自明解があります: ${coeffStr}`,
            });
        }
        if (n > m) {
            const p = document.createElement("p");
            p.textContent = `注釈（定理4.2.3）: 本数 n=${n} が次元 m=${m} より多いため、このn本は必ず1次従属になります。`;
            noteEl.appendChild(p);
        }
    }
    presetSel.addEventListener("change", () => {
        if (presetSel.value === "custom")
            return;
        const preset = PRESETS[Number(presetSel.value)];
        m = preset.m;
        n = preset.n;
        mSel.value = String(m);
        nSel.value = String(n);
        vectors = preset.vectors.map((v) => v.map((x) => frac(x)));
        buildGrid();
    });
    mSel.addEventListener("change", () => {
        m = Number(mSel.value);
        resetVectorsForDims();
        buildGrid();
    });
    nSel.addEventListener("change", () => {
        n = Number(nSel.value);
        resetVectorsForDims();
        buildGrid();
    });
    refs.operation.querySelector("#s04-run").addEventListener("click", run);
    buildGrid();
    run();
    renderQuiz(refs.quiz, [
        {
            prompt: "R³において、4本のベクトルは1次独立になり得ますか？",
            choices: ["いいえ（定理4.2.3により必ず1次従属）", "はい、常に1次独立", "ベクトルの値によって変わる"],
            correctIndex: 0,
            explanation: "次元3の空間では、4本（次元より多い本数）のベクトルは定理4.2.3により必ず1次従属になります。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "1次独立", def: "c1v1+...+cnvn=0 が c1=...=cn=0 のときしか成り立たないこと。" },
        { term: "1次従属", def: "すべてが0でない係数の組で、1次関係 c1v1+...+cnvn=0 が成り立つこと。" },
    ]);
}
//# sourceMappingURL=s04_independence.js.map