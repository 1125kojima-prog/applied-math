/**
 * S10 次元の定義と基底の要素数（第7回 p.54, p.59-60）
 */
import { frac } from "../math/fraction.js";
import { checkBasis } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderMatrix } from "../ui/matrix-view.js";
const SPACES = [
    {
        id: "r2",
        label: "R²",
        dim: 2,
        bases: [
            [[1, 0], [0, 1]],
            [[1, 2], [-2, 0]],
            [[1, 1], [1, -1]],
        ],
        note: "R² の次元は2です。",
    },
    {
        id: "r3",
        label: "R³",
        dim: 3,
        bases: [
            [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            [[1, 1, 0], [0, 1, 1], [1, 0, 1]],
        ],
        note: "R³ の次元は3です。",
    },
    {
        id: "poly2",
        label: "R[x]₂（2次以下の多項式、係数3個）",
        dim: 3,
        bases: [
            [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            [[1, 1, 1], [0, 1, 1], [0, 0, 1]],
        ],
        note: "R[x]₂ の次元は n+1 = 3 です。",
    },
    {
        id: "poly3",
        label: "R[x]₃（3次以下の多項式、係数4個）",
        dim: 4,
        bases: [
            [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
            [[1, 1, 1, 1], [0, 1, 1, 1], [0, 0, 1, 1], [0, 0, 0, 1]],
        ],
        note: "R[x]₃ の次元は n+1 = 4 です。",
    },
];
export function mountS10(container) {
    const refs = createSimLayout(container, {
        title: "次元の定義と基底の要素数",
        page: "p.54, p.59-60",
        lecture: "第7回",
        purpose: "次元 dim(V) = 基底の要素数は、基底の取り方によらず一定であることを確認する。",
        theorems: [{ id: "定理4.4.1", text: "基底の元の個数は基底の取り方によらず一定", page: "p.53" }],
    });
    let space = SPACES[0];
    let basisIndex = 0;
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s10-select">空間:</label>
      <select id="s10-select">${SPACES.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}</select>
    </div>
    <div class="field-row">
      <button type="button" id="s10-another">別の基底を選ぶ</button>
    </div>
  `;
    const select = refs.operation.querySelector("#s10-select");
    refs.display.innerHTML = `<div id="s10-matrix"></div><div id="s10-badge"></div>`;
    const matrixEl = refs.display.querySelector("#s10-matrix");
    const badgeEl = refs.display.querySelector("#s10-badge");
    function update() {
        const basis = space.bases[basisIndex].map((v) => v.map((x) => frac(x)));
        const check = checkBasis(basis, space.dim);
        renderMatrix(matrixEl, basis[0].map((_, i) => basis.map((v) => v[i])), {
            caption: "基底ベクトルを列として並べた行列",
        });
        const p = document.createElement("p");
        p.textContent = `この基底の要素数: ${basis.length} 本（${check.isBasis ? "基底として有効" : "基底ではありません（要確認）"}）`;
        matrixEl.appendChild(p);
        renderBadge(badgeEl, {
            verdict: "yes",
            title: `dim(${space.label}) = ${space.dim}`,
            reason: `${space.note} 基底の取り方を変えても、要素数は常に ${space.dim} 本です（定理4.4.1）。`,
        });
    }
    select.addEventListener("change", () => {
        space = SPACES.find((s) => s.id === select.value) ?? SPACES[0];
        basisIndex = 0;
        update();
    });
    refs.operation.querySelector("#s10-another").addEventListener("click", () => {
        basisIndex = (basisIndex + 1) % space.bases.length;
        update();
    });
    update();
    renderQuiz(refs.quiz, [
        {
            prompt: "R[x]₃（3次以下の多項式全体）の次元はいくつですか？",
            choices: ["4", "3", "無限"],
            correctIndex: 0,
            explanation: "1,x,x²,x³ の4つが基底になるため、次元は4です。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "次元", def: "ベクトル空間Vの基底に含まれるベクトルの個数。dim(V)と書く。" },
    ]);
}
//# sourceMappingURL=s10_dimension.js.map