/**
 * S02 連立一次方程式・掃き出し法のステッパー（事前学習2、第7回 p.55）
 *
 * 要確認: 指示書は「基本変形の種類をユーザーが選んで手動で適用する」モードも
 * 示唆しているが、時間の都合でここでは「次へ/前へ/自動再生」で自動実行される
 * 標準のGauss-Jordan法のステップを1つずつ見せる方式のみを実装した。
 * 各ステップの説明文に、3種類の基本変形（行の定数倍・行の交換・他の行の定数倍を加える）
 * のうちどれを使ったかが日本語で明記される。
 */
import { frac } from "../math/fraction.js";
import { rrefWithSteps } from "../math/matrix.js";
import { solveLinear } from "../math/matrix.js";
import { createSimLayout, renderGlossary } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";
import { Stepper } from "../ui/stepper.js";
const DEFAULT_A = [
    [2, 3, -1],
    [-1, 2, 2],
    [1, 1, -1],
];
const DEFAULT_B = [-3, 1, -2];
export function mountS02(container) {
    const refs = createSimLayout(container, {
        title: "S02 連立一次方程式・掃き出し法のステッパー",
        page: "p.55（事前学習2 p.11）",
        lecture: "第7回 / 事前学習2",
        purpose: "拡大係数行列を基本変形で階段行列に変え、解を求める過程をステップごとに見る。",
    });
    let m = 3;
    let n = 3;
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s02-m">式の数 m</label>
      <select id="s02-m">${[2, 3, 4].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
      <label for="s02-n">変数の数 n</label>
      <select id="s02-n">${[2, 3, 4].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s02-grid"></div>
    <div class="field-row">
      <button type="button" id="s02-default">事前学習2の例を入れる</button>
      <button type="button" id="s02-run">計算する</button>
    </div>
    <div id="s02-stepper"></div>
  `;
    const mSel = refs.operation.querySelector("#s02-m");
    const nSel = refs.operation.querySelector("#s02-n");
    mSel.value = "3";
    nSel.value = "3";
    const gridEl = refs.operation.querySelector("#s02-grid");
    const stepperEl = refs.operation.querySelector("#s02-stepper");
    refs.display.innerHTML = `
    <div id="s02-step-desc" class="step-description" aria-live="polite"></div>
    <div id="s02-matrix"></div>
    <div id="s02-result"></div>
  `;
    const stepDescEl = refs.display.querySelector("#s02-step-desc");
    const matrixEl = refs.display.querySelector("#s02-matrix");
    const resultEl = refs.display.querySelector("#s02-result");
    function buildGrid(prefillA, prefillB) {
        let rows = "";
        for (let i = 0; i < m; i++) {
            let cells = "";
            for (let j = 0; j < n; j++) {
                const val = prefillA?.[i]?.[j] ?? (i === j ? 1 : 0);
                cells += `<input type="number" class="s02-a" data-row="${i}" data-col="${j}" value="${val}" style="width:3.5em" aria-label="第${i + 1}行${j + 1}列の係数">`;
            }
            const bval = prefillB?.[i] ?? 0;
            rows += `<div class="field-row">${cells}<span aria-hidden="true">=</span><input type="number" class="s02-b" data-row="${i}" value="${bval}" style="width:3.5em" aria-label="第${i + 1}行の右辺"></div>`;
        }
        gridEl.innerHTML = rows;
    }
    function readMatrix() {
        const A = [];
        for (let i = 0; i < m; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                const el = gridEl.querySelector(`.s02-a[data-row="${i}"][data-col="${j}"]`);
                row.push(frac(Number(el.value) || 0));
            }
            A.push(row);
        }
        const b = [];
        for (let i = 0; i < m; i++) {
            const el = gridEl.querySelector(`.s02-b[data-row="${i}"]`);
            b.push(frac(Number(el.value) || 0));
        }
        return { A, b };
    }
    function run() {
        const { A, b } = readMatrix();
        const augmented = A.map((row, i) => [...row, b[i]]);
        const { steps, pivotCols } = rrefWithSteps(augmented);
        const displaySteps = [{ matrix: augmented, description: "初期状態（拡大係数行列 [A|b]）", highlightRows: [] }];
        for (const s of steps) {
            displaySteps.push({ matrix: s.matrixAfter, description: s.description, highlightRows: s.highlightRows });
        }
        const solveResult = solveLinear(A, b);
        new Stepper(stepperEl, displaySteps.length, {
            onStepChange: (index) => {
                const step = displaySteps[index];
                stepDescEl.textContent = step.description;
                const isLast = index === displaySteps.length - 1;
                renderMatrix(matrixEl, step.matrix, {
                    highlightRows: step.highlightRows,
                    augmentedAfterCol: n - 1,
                    pivotCells: isLast ? pivotCols.map((col, row) => ({ row, col })) : [],
                });
                if (isLast) {
                    renderResult(solveResult, pivotCols);
                }
                else {
                    resultEl.innerHTML = "";
                }
            },
        });
    }
    function renderResult(result, pivotCols) {
        const rank = pivotCols.filter((c) => c < n).length;
        let html = `<p>ランク rank([A|b]の係数部分) = ${rank}</p>`;
        resultEl.innerHTML = html;
        if (result.type === "none") {
            renderBadge(resultEl, { verdict: "no", title: "解なし（不能）", reason: "簡約化した行に「0=非ゼロ」の矛盾が現れたため、解は存在しません。" });
        }
        else if (result.type === "unique") {
            renderBadge(resultEl, {
                verdict: "yes",
                title: "解は一意（唯一解）",
                reason: `rank(A) = ${n} = 変数の個数 なので、解はただ1つに決まります。`,
            });
            const p = document.createElement("p");
            p.textContent = "解: " + result.solution.map((f, i) => `x${i + 1}=${f.toString()}`).join(", ");
            resultEl.appendChild(p);
        }
        else {
            renderBadge(resultEl, {
                verdict: "neutral",
                title: "解は不定（無数にある）",
                reason: `rank(A) = ${n - result.freeCols.length} < 変数の個数 ${n} なので、自由変数が ${result.freeCols.length} 個あります。`,
            });
            const p = document.createElement("p");
            p.textContent = `自由変数: ${result.freeCols.map((c) => `x${c + 1}`).join(", ")}`;
            resultEl.appendChild(p);
        }
    }
    mSel.addEventListener("change", () => {
        m = Number(mSel.value);
        buildGrid();
    });
    nSel.addEventListener("change", () => {
        n = Number(nSel.value);
        buildGrid();
    });
    refs.operation.querySelector("#s02-default").addEventListener("click", () => {
        m = 3;
        n = 3;
        mSel.value = "3";
        nSel.value = "3";
        buildGrid(DEFAULT_A, DEFAULT_B);
    });
    refs.operation.querySelector("#s02-run").addEventListener("click", run);
    buildGrid(DEFAULT_A, DEFAULT_B);
    run();
    renderGlossary(refs.glossary, [
        { term: "簡約行基本形（RREF）", def: "各ピボット列が単位ベクトルになるように基本変形を行った行列の形。" },
        { term: "ピボット（主成分）", def: "各行で最初に現れる非ゼロの要素（簡約化後は1）。" },
        { term: "自由変数", def: "RREFでピボットを持たない列に対応する変数。自由に値を選べる。" },
    ]);
}
//# sourceMappingURL=s02_gauss.js.map