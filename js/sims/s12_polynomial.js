/**
 * S12 多項式空間とグラフ（第3・4・7回、R[x]ₙ）
 * 多項式を係数ベクトルとして扱い、グラフと1次独立性判定を連動させる。
 * 既定値は例題4.3.2（PDF確認済み、p.46）の5つの多項式。
 */
import { Fraction, frac } from "../math/fraction.js";
import { isIndependent, nontrivialDependency, polyEval, polyToLatex } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { renderAllMath } from "../ui/katex-loader.js";
import { PALETTE, observeCanvasResize } from "../ui/vector-canvas.js";
const DEFAULT_F = [
    [1, 1, 3, 0],
    [1, 2, 0, -1],
    [1, 3, -3, -2],
    [-2, -4, 1, -1],
    [-1, -4, 7, 0],
];
const COLORS = [PALETTE.blue, PALETTE.orange, PALETTE.green, PALETTE.vermillion, PALETTE.purple];
const DASHES = [[], [8, 4], [2, 3], [10, 3, 2, 3], [1, 4]];
export function mountS12(container) {
    const refs = createSimLayout(container, {
        title: "多項式空間とグラフ",
        page: "p.32, p.46",
        lecture: "第3・4・7回",
        purpose: "多項式を係数ベクトルとして扱い、グラフと1次独立性判定を連動させて確認する。",
    });
    let n = 5;
    let coeffs = DEFAULT_F.map((v) => v.map((x) => frac(x)));
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s12-n">多項式の個数</label><select id="s12-n">${[2, 3, 4, 5].map((v) => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div id="s12-grid"></div>
    <button type="button" id="s12-default">例題4.3.2の5個を使う</button>
  `;
    const nSel = refs.operation.querySelector("#s12-n");
    nSel.value = String(n);
    const gridEl = refs.operation.querySelector("#s12-grid");
    refs.display.innerHTML = `
    <canvas id="s12-canvas" class="vector-canvas" width="380" height="300"></canvas>
    <div id="s12-legend" class="canvas-legend"></div>
    <div id="s12-vectors"></div>
    <div id="s12-badge"></div>
  `;
    const canvasEl = refs.display.querySelector("#s12-canvas");
    const legendEl = refs.display.querySelector("#s12-legend");
    const vectorsEl = refs.display.querySelector("#s12-vectors");
    const badgeEl = refs.display.querySelector("#s12-badge");
    const ctx = canvasEl.getContext("2d");
    let cssW = 380;
    let cssH = 300;
    observeCanvasResize(canvasEl, (w, h) => {
        cssW = w;
        cssH = h;
        drawGraph();
    });
    function buildGrid() {
        let html = "";
        for (let j = 0; j < n; j++) {
            const cells = [0, 1, 2, 3]
                .map((k) => `<input type="number" class="s12-cell" data-col="${j}" data-row="${k}" value="${coeffs[j]?.[k]?.toNumber() ?? 0}" style="width:3.5em">`)
                .join("");
            html += `<div class="field-row"><span class="legend-swatch" style="background:${COLORS[j % 5]}"></span>f${j + 1}: a0,a1,a2,a3 = ${cells}</div>`;
        }
        gridEl.innerHTML = html;
        gridEl.querySelectorAll(".s12-cell").forEach((el) => {
            el.addEventListener("input", () => {
                const col = Number(el.dataset.col);
                const row = Number(el.dataset.row);
                if (!coeffs[col])
                    coeffs[col] = new Array(4).fill(Fraction.zero());
                coeffs[col][row] = frac(Number(el.value) || 0);
                update();
            });
        });
    }
    function resize() {
        const newCoeffs = [];
        for (let j = 0; j < n; j++) {
            const v = [];
            for (let k = 0; k < 4; k++)
                v.push(coeffs[j]?.[k] ?? Fraction.zero());
            newCoeffs.push(v);
        }
        coeffs = newCoeffs;
    }
    function worldToScreen(x, y, yRange) {
        const w = cssW;
        const h = cssH;
        const sx = w / 6; // x: -3..3
        const sy = h / (2 * yRange);
        return { x: w / 2 + x * sx, y: h / 2 - y * sy };
    }
    function drawGraph() {
        const style = getComputedStyle(canvasEl);
        ctx.fillStyle = style.getPropertyValue("--canvas-bg") || "#fff";
        ctx.fillRect(0, 0, cssW, cssH);
        let yMax = 1;
        const samples = coeffs.map((c) => {
            const ys = [];
            for (let xi = -30; xi <= 30; xi++) {
                const x = xi / 10;
                const y = polyEval(c, frac(Math.round(x * 10), 10)).toNumber();
                ys.push(y);
                if (Math.abs(y) > yMax)
                    yMax = Math.abs(y);
            }
            return ys;
        });
        yMax = Math.min(yMax * 1.1, 50);
        ctx.strokeStyle = style.getPropertyValue("--canvas-grid") || "#ddd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const axisX = worldToScreen(0, 0, yMax);
        ctx.moveTo(0, axisX.y);
        ctx.lineTo(cssW, axisX.y);
        ctx.moveTo(axisX.x, 0);
        ctx.lineTo(axisX.x, cssH);
        ctx.stroke();
        samples.forEach((ys, j) => {
            ctx.strokeStyle = COLORS[j % 5];
            ctx.lineWidth = 3;
            ctx.setLineDash(DASHES[j % 5]);
            ctx.beginPath();
            ys.forEach((y, idx) => {
                const x = -3 + idx * 0.1;
                const p = worldToScreen(x, y, yMax);
                if (idx === 0)
                    ctx.moveTo(p.x, p.y);
                else
                    ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        });
        ctx.setLineDash([]);
        legendEl.innerHTML = coeffs
            .map((_, j) => `<span><span class="legend-swatch" style="background:${COLORS[j % 5]}"></span>f${j + 1}(x) = <span data-katex="${polyToLatex(coeffs[j])}"></span>（線種${j + 1}）</span>`)
            .join("");
        renderAllMath(legendEl);
    }
    function update() {
        drawGraph();
        vectorsEl.innerHTML =
            "<h4>係数ベクトル</h4>" + coeffs.map((c, j) => `<p>f${j + 1} → [${c.map((x) => x.toString()).join(", ")}]</p>`).join("");
        const independent = isIndependent(coeffs);
        if (independent) {
            renderBadge(badgeEl, { verdict: "yes", title: "係数ベクトルは1次独立", reason: `${n}個の多項式は1次独立です。` });
        }
        else {
            const dep = nontrivialDependency(coeffs);
            const relation = dep ? dep.map((f, i) => `(${f.toString()})f${i + 1}`).join(" + ") + " = 0" : "";
            renderBadge(badgeEl, { verdict: "no", title: "係数ベクトルは1次従属", reason: `1次関係: ${relation}` });
        }
    }
    nSel.addEventListener("change", () => {
        n = Number(nSel.value);
        resize();
        buildGrid();
        update();
    });
    refs.operation.querySelector("#s12-default").addEventListener("click", () => {
        n = 5;
        nSel.value = "5";
        coeffs = DEFAULT_F.map((v) => v.map((x) => frac(x)));
        buildGrid();
        update();
    });
    buildGrid();
    update();
    renderQuiz(refs.quiz, [
        {
            prompt: "例題4.3.2の5つの多項式の係数ベクトルのランクは？",
            choices: ["3", "5", "2"],
            correctIndex: 0,
            explanation: "係数行列を簡約化するとrank=3になり、1次独立な最大個数は3です。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "係数ベクトル", def: "多項式 a0+a1x+a2x²+a3x³ を (a0,a1,a2,a3) という数の組として表したもの。" },
    ]);
}
//# sourceMappingURL=s12_polynomial.js.map