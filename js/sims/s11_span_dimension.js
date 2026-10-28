/**
 * S11 生成される部分空間の次元（第7回 p.59-60、例題4.4.4）
 * 既定値はPDF確認済みの f1=1+x+3x², f2=1+2x-x³, f3=1+3x-3x²-2x³,
 * f4=-2-4x+x²-x³, f5=-1-4x+7x²（rank=3、極大組はノートでは{f1,f2,f4}）。
 */
import { Fraction, frac } from "../math/fraction.js";
import { extractMaximalIndependent, polyToLatex } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";
import { renderAllMath } from "../ui/katex-loader.js";
const DEFAULT_F = [
    [1, 1, 3, 0],
    [1, 2, 0, -1],
    [1, 3, -3, -2],
    [-2, -4, 1, -1],
    [-1, -4, 7, 0],
];
export function mountS11(container) {
    const refs = createSimLayout(container, {
        title: "生成される部分空間の次元",
        page: "p.59-60",
        lecture: "第7回",
        purpose: "ベクトルの組が張る部分空間の次元 = 極大1次独立組の要素数（定理4.4.4）を確認する。",
        theorems: [{ id: "定理4.4.4", text: "dim⟨u1,…,ut⟩ = u1,…,ut の1次独立な最大個数", page: "p.59" }],
    });
    let n = 5;
    let vectors = DEFAULT_F.map((v) => v.map((x) => frac(x)));
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s11-n">本数</label><select id="s11-n">${[2, 3, 4, 5].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s11-grid"></div>
    <div class="field-row">
      <button type="button" id="s11-default">第7回の例（f1..f5）を使う</button>
      <button type="button" id="s11-run">計算する</button>
    </div>
  `;
    const nSel = refs.operation.querySelector("#s11-n");
    nSel.value = String(n);
    const gridEl = refs.operation.querySelector("#s11-grid");
    refs.display.innerHTML = `<div id="s11-result"></div>`;
    const resultEl = refs.display.querySelector("#s11-result");
    function buildGrid() {
        let html = "";
        for (let j = 0; j < n; j++) {
            const cells = [0, 1, 2, 3]
                .map((k) => `<input type="number" class="s11-cell" data-col="${j}" data-row="${k}" value="${vectors[j]?.[k]?.toNumber() ?? 0}" style="width:3.5em">`)
                .join("");
            html += `<div class="field-row">f${j + 1} の係数 (a0,a1,a2,a3) = ${cells}</div>`;
        }
        gridEl.innerHTML = html;
        gridEl.querySelectorAll(".s11-cell").forEach((el) => {
            el.addEventListener("input", () => {
                const col = Number(el.dataset.col);
                const row = Number(el.dataset.row);
                if (!vectors[col])
                    vectors[col] = new Array(4).fill(Fraction.zero());
                vectors[col][row] = frac(Number(el.value) || 0);
            });
        });
    }
    function resize() {
        const newVectors = [];
        for (let j = 0; j < n; j++) {
            const v = [];
            for (let k = 0; k < 4; k++)
                v.push(vectors[j]?.[k] ?? Fraction.zero());
            newVectors.push(v);
        }
        vectors = newVectors;
    }
    function run() {
        const extraction = extractMaximalIndependent(vectors);
        resultEl.innerHTML = "";
        const matHost = document.createElement("div");
        matHost.innerHTML = "<h4>簡約行基本形 B</h4>";
        renderMatrix(matHost, extraction.rrefMatrix, { pivotCells: extraction.pivotIndices.map((c, r) => ({ row: r, col: c })) });
        resultEl.appendChild(matHost);
        const maxSet = extraction.pivotIndices.map((i) => `f${i + 1}`).join(", ");
        renderBadge(resultEl, {
            verdict: "yes",
            title: `dim⟨f1,…,f${n}⟩ = ${extraction.rank}`,
            reason: `極大1次独立組 {${maxSet}} の要素数が、生成される部分空間の次元です（定理4.4.4）。`,
        });
        extraction.combinations.forEach((coeffs, j) => {
            const terms = coeffs
                .map((c, k) => {
                const label = `f${extraction.pivotIndices[k] + 1}`;
                if (c.isZero())
                    return null;
                return c.equals(Fraction.one()) ? label : c.equals(Fraction.one().neg()) ? `-${label}` : `${c.toString()}${label}`;
            })
                .filter((s) => s !== null)
                .join(" + ")
                .replace(/\+ -/g, "- ");
            const p = document.createElement("p");
            p.textContent = `f${j + 1} = ${terms || "0"}`;
            resultEl.appendChild(p);
        });
        const polyHost = document.createElement("div");
        polyHost.innerHTML = "<h4>多項式としての表示</h4>" + vectors.map((v, i) => `<p>f${i + 1}(x) = <span data-katex="${polyToLatex(v)}"></span></p>`).join("");
        resultEl.appendChild(polyHost);
        renderAllMath(polyHost);
    }
    nSel.addEventListener("change", () => {
        n = Number(nSel.value);
        resize();
        buildGrid();
    });
    refs.operation.querySelector("#s11-default").addEventListener("click", () => {
        n = 5;
        nSel.value = "5";
        vectors = DEFAULT_F.map((v) => v.map((x) => frac(x)));
        buildGrid();
    });
    refs.operation.querySelector("#s11-run").addEventListener("click", run);
    buildGrid();
    run();
    renderQuiz(refs.quiz, [
        {
            prompt: "f1..f5（係数行列のrankが3）が張る部分空間の次元は？",
            choices: ["3", "5", "4"],
            correctIndex: 0,
            explanation: "生成される部分空間の次元は、極大1次独立組の要素数（=rank）と一致します。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "⟨u1,…,ut⟩", def: "u1,…,ut の1次結合全体からなる部分空間（u1,…,utが張る/生成する部分空間）。" },
    ]);
}
//# sourceMappingURL=s11_span_dimension.js.map