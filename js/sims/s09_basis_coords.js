/**
 * S09 基底と座標（第6回 p.51-56）— 最重要
 * ノートの例（p.52）: 標準基底{e1,e2}と、別の基底{(1,2),(-2,0)}。
 * x=[3,-2] を後者の基底で表すと c1=-1, c2=-2（検算: -1*(1,2)-2*(-2,0)=(3,-2)）。
 */
import { frac } from "../math/fraction.js";
import { checkBasis, coordinates } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge, renderConditionList } from "../ui/badge.js";
import { VectorCanvas, PALETTE } from "../ui/vector-canvas.js";
export function mountS09(container) {
    const refs = createSimLayout(container, {
        title: "基底と座標",
        page: "p.51-56",
        lecture: "第6回",
        purpose: "基底（1次独立かつ生成する）を理解し、ベクトルxの座標(c1,c2)を求める。",
        theorems: [{ id: "定理4.4.1", text: "基底の元の個数は、基底の取り方によらず一定", page: "p.53" }],
    });
    let u1 = [frac(1), frac(2)];
    let u2 = [frac(-2), frac(0)];
    let x = [frac(3), frac(-2)];
    refs.operation.innerHTML = `
    <div class="field-row">
      <button type="button" id="s09-preset-note">ノートの例 {(1,2),(-2,0)} を使う</button>
      <button type="button" id="s09-preset-std">標準基底 {(1,0),(0,1)} を使う</button>
    </div>
    <p>u1, u2, x をCanvas上でドラッグして動かせます。</p>
    <div id="s09-canvas-wrap"></div>
  `;
    const canvasWrap = refs.operation.querySelector("#s09-canvas-wrap");
    refs.display.innerHTML = `
    <div id="s09-conditions"></div>
    <div id="s09-badge"></div>
    <div id="s09-coord"></div>
    <h4>標準基底との比較</h4>
    <div id="s09-compare"></div>
  `;
    const conditionsEl = refs.display.querySelector("#s09-conditions");
    const badgeEl = refs.display.querySelector("#s09-badge");
    const coordEl = refs.display.querySelector("#s09-coord");
    const compareEl = refs.display.querySelector("#s09-compare");
    const canvasEl = document.createElement("canvas");
    canvasEl.className = "vector-canvas";
    canvasEl.width = 380;
    canvasEl.height = 380;
    canvasWrap.appendChild(canvasEl);
    const canvas = new VectorCanvas(canvasEl, {
        range: 4,
        snapGrid: 1,
        onDrag: (id, pos) => {
            const fv = [frac(Math.round(pos.x)), frac(Math.round(pos.y))];
            if (id === "u1")
                u1 = fv;
            else if (id === "u2")
                u2 = fv;
            else if (id === "x")
                x = fv;
            update();
        },
    });
    function buildLattice() {
        const lines = [];
        const range = 6;
        const u1n = { x: u1[0].toNumber(), y: u1[1].toNumber() };
        const u2n = { x: u2[0].toNumber(), y: u2[1].toNumber() };
        for (let k = -range; k <= range; k++) {
            // u2方向の線: p = k*u1 + t*u2
            lines.push({
                from: { x: k * u1n.x - range * u2n.x, y: k * u1n.y - range * u2n.y },
                to: { x: k * u1n.x + range * u2n.x, y: k * u1n.y + range * u2n.y },
                color: "#9aa3ad55",
            });
            // u1方向の線: p = k*u2 + t*u1
            lines.push({
                from: { x: k * u2n.x - range * u1n.x, y: k * u2n.y - range * u1n.y },
                to: { x: k * u2n.x + range * u1n.x, y: k * u2n.y + range * u1n.y },
                color: "#9aa3ad55",
            });
        }
        return lines;
    }
    function update() {
        const check = checkBasis([u1, u2], 2);
        const vectors = [
            { from: { x: 0, y: 0 }, to: { x: u1[0].toNumber(), y: u1[1].toNumber() }, color: PALETTE.blue, label: "u1" },
            { from: { x: 0, y: 0 }, to: { x: u2[0].toNumber(), y: u2[1].toNumber() }, color: PALETTE.orange, label: "u2" },
            { from: { x: 0, y: 0 }, to: { x: x[0].toNumber(), y: x[1].toNumber() }, color: PALETTE.green, label: "x" },
        ];
        const draggables = [
            { id: "u1", pos: { x: u1[0].toNumber(), y: u1[1].toNumber() }, color: PALETTE.blue, label: "u1" },
            { id: "u2", pos: { x: u2[0].toNumber(), y: u2[1].toNumber() }, color: PALETTE.orange, label: "u2" },
            { id: "x", pos: { x: x[0].toNumber(), y: x[1].toNumber() }, color: PALETTE.green, label: "x" },
        ];
        canvas.setVectors(vectors);
        canvas.setDraggables(draggables);
        canvas.setExtraLines(check.isBasis ? buildLattice() : []);
        canvas.render();
        renderConditionList(conditionsEl, [
            { label: "u1, u2 は1次独立", ok: check.isIndependent },
            { label: "u1, u2 は R² を生成する", ok: check.spans },
        ]);
        renderBadge(badgeEl, {
            verdict: check.isBasis ? "yes" : "no",
            title: check.isBasis ? "{u1, u2} は R² の基底です" : "{u1, u2} は R² の基底ではありません",
            reason: check.isBasis
                ? "1次独立かつR²を生成するため、基底の条件を満たします。"
                : "1次独立でないか、R²全体を生成できていません（例: u1とu2が平行）。",
        });
        coordEl.innerHTML = "";
        if (check.isBasis) {
            const result = coordinates([u1, u2], x);
            if (result.ok) {
                const [c1, c2] = result.coeffs;
                const p = document.createElement("p");
                p.innerHTML = `x = <strong>${c1.toString()}</strong>·u1 + <strong>${c2.toString()}</strong>·u2　（座標: (${c1.toString()}, ${c2.toString()})）`;
                coordEl.appendChild(p);
                const check2 = document.createElement("p");
                const verify0 = u1[0].mul(c1).add(u2[0].mul(c2));
                const verify1 = u1[1].mul(c1).add(u2[1].mul(c2));
                check2.textContent = `検算: ${c1.toString()}×(${u1.map((v) => v.toString()).join(",")}) + ${c2.toString()}×(${u2
                    .map((v) => v.toString())
                    .join(",")}) = (${verify0.toString()}, ${verify1.toString()})`;
                coordEl.appendChild(check2);
            }
        }
        else {
            coordEl.innerHTML = "<p>基底ではないため、座標は（一意には）決まりません。</p>";
        }
        const stdResult = coordinates([
            [frac(1), frac(0)],
            [frac(0), frac(1)],
        ], x);
        compareEl.innerHTML = "";
        if (stdResult.ok) {
            const p1 = document.createElement("p");
            p1.textContent = `標準基底 {e1,e2} での座標: (${stdResult.coeffs[0].toString()}, ${stdResult.coeffs[1].toString()})（xの成分そのもの）`;
            compareEl.appendChild(p1);
        }
        if (check.isBasis) {
            const result = coordinates([u1, u2], x);
            if (result.ok) {
                const p2 = document.createElement("p");
                p2.textContent = `今の基底 {u1,u2} での座標: (${result.coeffs[0].toString()}, ${result.coeffs[1].toString()})　※同じxでも基底が違えば座標は異なります。`;
                compareEl.appendChild(p2);
            }
        }
    }
    refs.operation.querySelector("#s09-preset-note").addEventListener("click", () => {
        u1 = [frac(1), frac(2)];
        u2 = [frac(-2), frac(0)];
        x = [frac(3), frac(-2)];
        update();
    });
    refs.operation.querySelector("#s09-preset-std").addEventListener("click", () => {
        u1 = [frac(1), frac(0)];
        u2 = [frac(0), frac(1)];
        update();
    });
    update();
    renderQuiz(refs.quiz, [
        {
            prompt: "ノートの例で、x=(3,-2) を基底 {(1,2),(-2,0)} で表すと座標は？",
            choices: ["(-1, -2)", "(1, 2)", "(3, -2)"],
            correctIndex: 0,
            explanation: "-1×(1,2) - 2×(-2,0) = (-1+4, -2+0) = (3,-2) となり一致します。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "基底", def: "1次独立で、かつ空間全体を生成するベクトルの組。" },
        { term: "座標", def: "x = c1u1+...+cnun のときの (c1,...,cn)。基底ごとに値が変わる。" },
    ]);
}
//# sourceMappingURL=s09_basis_coords.js.map