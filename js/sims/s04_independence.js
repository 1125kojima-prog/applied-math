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
import { VectorCanvas, PALETTE, observeCanvasResize } from "../ui/vector-canvas.js";
const CANVAS_COLORS = [PALETTE.blue, PALETTE.orange, PALETTE.green, PALETTE.vermillion];
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
        title: "1次独立・1次従属の判定",
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
      <label for="s04-m">次元</label><select id="s04-m"><option value="2">2次元（R²）</option><option value="3">3次元（R³）</option></select>
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
    <h4>図で見る</h4>
    <div id="s04-canvas-hint" class="condition-detail"></div>
    <div id="s04-canvas-wrap"></div>
    <div id="s04-badge"></div>
    <div id="s04-note"></div>
  `;
    const stepDescEl = refs.display.querySelector("#s04-step-desc");
    const matrixEl = refs.display.querySelector("#s04-matrix");
    const canvasHintEl = refs.display.querySelector("#s04-canvas-hint");
    const canvasWrapEl = refs.display.querySelector("#s04-canvas-wrap");
    const badgeEl = refs.display.querySelector("#s04-badge");
    const noteEl = refs.display.querySelector("#s04-note");
    // --- 図（R²はドラッグ、R³は既存の投影図と同様にドラッグで視点を回転） ---
    let canvas2D = null;
    let canvas3DEl = null;
    let ctx3 = null;
    let cssW3 = 360;
    let cssH3 = 360;
    let az = 35; // 方位角（度）
    let elev = 20; // 仰角（度）
    function vecComponent(j, k) {
        return vectors[j]?.[k]?.toNumber() ?? 0;
    }
    function project3(v) {
        const radAz = (az * Math.PI) / 180;
        const radEl = (elev * Math.PI) / 180;
        const x1 = v[0] * Math.cos(radAz) - v[2] * Math.sin(radAz);
        const z1 = v[0] * Math.sin(radAz) + v[2] * Math.cos(radAz);
        const y1 = v[1];
        const y2 = y1 * Math.cos(radEl) - z1 * Math.sin(radEl);
        return { x: x1, y: y2 };
    }
    function worldToScreen3(p) {
        const scale = Math.min(cssW3, cssH3) / 9;
        return { x: cssW3 / 2 + p.x * scale, y: cssH3 / 2 - p.y * scale };
    }
    function draw3D() {
        if (!canvas3DEl || !ctx3)
            return;
        const style = getComputedStyle(canvas3DEl);
        ctx3.fillStyle = style.getPropertyValue("--canvas-bg") || "#fff";
        ctx3.fillRect(0, 0, cssW3, cssH3);
        const axisColor = style.getPropertyValue("--canvas-grid") || "#ddd";
        const axes = [
            { v: [3.5, 0, 0], label: "x" },
            { v: [0, 3.5, 0], label: "y" },
            { v: [0, 0, 3.5], label: "z" },
        ];
        ctx3.strokeStyle = axisColor;
        ctx3.lineWidth = 1;
        ctx3.font = "14px sans-serif";
        ctx3.fillStyle = style.getPropertyValue("--canvas-text") || "#333";
        for (const ax of axes) {
            const from = worldToScreen3(project3([0, 0, 0]));
            const to = worldToScreen3(project3(ax.v));
            ctx3.beginPath();
            ctx3.moveTo(from.x, from.y);
            ctx3.lineTo(to.x, to.y);
            ctx3.stroke();
            ctx3.fillText(ax.label, to.x + 4, to.y + 4);
        }
        if (m === 3) {
            for (let j = 0; j < n; j++) {
                const color = CANVAS_COLORS[j % CANVAS_COLORS.length];
                const from = worldToScreen3(project3([0, 0, 0]));
                const to = worldToScreen3(project3([vecComponent(j, 0), vecComponent(j, 1), vecComponent(j, 2)]));
                ctx3.strokeStyle = color;
                ctx3.fillStyle = color;
                ctx3.lineWidth = 3;
                ctx3.beginPath();
                ctx3.moveTo(from.x, from.y);
                ctx3.lineTo(to.x, to.y);
                ctx3.stroke();
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                ctx3.beginPath();
                ctx3.moveTo(to.x, to.y);
                ctx3.lineTo(to.x - 10 * Math.cos(angle - Math.PI / 7), to.y - 10 * Math.sin(angle - Math.PI / 7));
                ctx3.lineTo(to.x - 10 * Math.cos(angle + Math.PI / 7), to.y - 10 * Math.sin(angle + Math.PI / 7));
                ctx3.closePath();
                ctx3.fill();
                ctx3.font = "bold 15px sans-serif";
                ctx3.strokeStyle = style.getPropertyValue("--canvas-label-bg") || "#fff";
                ctx3.lineWidth = 3;
                ctx3.strokeText(`v${j + 1}`, to.x + 6, to.y - 6);
                ctx3.fillStyle = color;
                ctx3.fillText(`v${j + 1}`, to.x + 6, to.y - 6);
            }
        }
    }
    function refresh2D() {
        if (!canvas2D)
            return;
        const vecs = [];
        const drags = [];
        for (let j = 0; j < n; j++) {
            const color = CANVAS_COLORS[j % CANVAS_COLORS.length];
            const pos = { x: vecComponent(j, 0), y: vecComponent(j, 1) };
            vecs.push({ from: { x: 0, y: 0 }, to: pos, color, label: `v${j + 1}` });
            drags.push({ id: `v${j}`, pos, color, label: `v${j + 1}` });
        }
        canvas2D.setVectors(vecs);
        canvas2D.setDraggables(drags);
        canvas2D.render();
    }
    function refreshCanvas() {
        if (m === 2)
            refresh2D();
        else
            draw3D();
    }
    function syncGridInputs() {
        gridEl.querySelectorAll(".s04-cell").forEach((el2) => {
            if (document.activeElement === el2)
                return;
            const col = Number(el2.dataset.col);
            const row = Number(el2.dataset.row);
            el2.value = String(vecComponent(col, row));
        });
    }
    function setupCanvasForDimension() {
        canvasWrapEl.innerHTML = "";
        canvas2D = null;
        canvas3DEl = null;
        ctx3 = null;
        if (m === 2) {
            canvasHintEl.textContent = "v1〜v4 を点としてドラッグして動かせます。";
            const c = document.createElement("canvas");
            c.className = "vector-canvas";
            c.width = 360;
            c.height = 360;
            canvasWrapEl.appendChild(c);
            canvas2D = new VectorCanvas(c, {
                range: 4,
                snapGrid: 0.5,
                onDrag: (id, pos) => {
                    const idx = Number(id.slice(1));
                    vectors[idx] = [frac(Math.round(pos.x * 2), 2), frac(Math.round(pos.y * 2), 2)];
                    syncGridInputs();
                    refresh2D();
                    renderFinal();
                },
            });
        }
        else {
            canvasHintEl.textContent = "ドラッグして視点を回転できます（既存の投影図と同様の操作）。";
            const c3 = document.createElement("canvas");
            c3.className = "vector-canvas";
            c3.width = 360;
            c3.height = 360;
            c3.style.touchAction = "none";
            canvasWrapEl.appendChild(c3);
            canvas3DEl = c3;
            ctx3 = c3.getContext("2d");
            observeCanvasResize(c3, (w, h) => {
                cssW3 = w;
                cssH3 = h;
                draw3D();
            });
            let dragging = false;
            let lastX = 0;
            let lastY = 0;
            c3.addEventListener("pointerdown", (ev) => {
                dragging = true;
                lastX = ev.clientX;
                lastY = ev.clientY;
                c3.setPointerCapture(ev.pointerId);
            });
            c3.addEventListener("pointermove", (ev) => {
                if (!dragging)
                    return;
                const dx = ev.clientX - lastX;
                const dy = ev.clientY - lastY;
                lastX = ev.clientX;
                lastY = ev.clientY;
                az = (az + dx * 0.5 + 360) % 360;
                elev = Math.max(-85, Math.min(85, elev - dy * 0.5));
                draw3D();
            });
            const stopDrag = () => {
                dragging = false;
            };
            c3.addEventListener("pointerup", stopDrag);
            c3.addEventListener("pointercancel", stopDrag);
        }
        refreshCanvas();
    }
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
                refreshCanvas();
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
        setupCanvasForDimension();
    });
    mSel.addEventListener("change", () => {
        m = Number(mSel.value);
        resetVectorsForDims();
        buildGrid();
        setupCanvasForDimension();
    });
    nSel.addEventListener("change", () => {
        n = Number(nSel.value);
        resetVectorsForDims();
        buildGrid();
        refreshCanvas();
    });
    refs.operation.querySelector("#s04-run").addEventListener("click", run);
    buildGrid();
    setupCanvasForDimension();
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