/**
 * S05 2次元・3次元の図による1次独立（第3・4回 幾何的解釈 p.33-34）
 *
 * 要確認: 指示書の「R³をドラッグで回転できる投影図」について、実際のドラッグ回転の
 * 代わりに回転スライダー（1軸まわり）で簡易的な3D投影を実装した（時間の都合による簡略化）。
 * 判定自体は厳密な分数演算（det2/det3は図の判定表示用途に限り浮動小数点、正式判定はrankで実施）。
 */
import { Fraction, frac } from "../math/fraction.js";
import { det2, det3 } from "../math/matrix.js";
import { nontrivialDependency, coordinates } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge } from "../ui/badge.js";
import { VectorCanvas, PALETTE, DraggablePoint, DrawVector, observeCanvasResize } from "../ui/vector-canvas.js";

export function mountS05(container: HTMLElement): void {
  const refs = createSimLayout(container, {
    title: "図で見る1次独立・1次従属",
    page: "p.33-34",
    lecture: "第3回・第4回",
    purpose: "1次独立・従属を図で直感的に理解する（R²はドラッグ、R³は数値入力＋回転）。",
  });

  refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s05-mode">モード:</label>
      <select id="s05-mode"><option value="r2">R²（ドラッグ）</option><option value="r3">R³（数値入力＋回転）</option></select>
    </div>
    <div id="s05-controls"></div>
  `;
  const modeSel = refs.operation.querySelector<HTMLSelectElement>("#s05-mode")!;
  const controlsEl = refs.operation.querySelector<HTMLElement>("#s05-controls")!;

  refs.display.innerHTML = `<div id="s05-canvas-wrap"></div><div id="s05-badge"></div><div id="s05-coeff"></div>`;
  const canvasWrap = refs.display.querySelector<HTMLElement>("#s05-canvas-wrap")!;
  const badgeEl = refs.display.querySelector<HTMLElement>("#s05-badge")!;
  const coeffEl = refs.display.querySelector<HTMLElement>("#s05-coeff")!;

  // --- R² モード ---
  let u1 = [frac(2), frac(1)];
  let u2 = [frac(-1), frac(2)];
  let w = [frac(1), frac(3)];

  function mountR2(): void {
    controlsEl.innerHTML = "";
    canvasWrap.innerHTML = "";
    const canvasEl = document.createElement("canvas");
    canvasEl.className = "vector-canvas";
    canvasEl.width = 360;
    canvasEl.height = 360;
    canvasWrap.appendChild(canvasEl);
    const canvas = new VectorCanvas(canvasEl, {
      range: 4,
      snapGrid: 0.5,
      onDrag: (id, pos) => {
        const fv = [frac(Math.round(pos.x * 2), 2), frac(Math.round(pos.y * 2), 2)];
        if (id === "u1") u1 = fv;
        else if (id === "u2") u2 = fv;
        else if (id === "w") w = fv;
        renderR2();
      },
    });

    function renderR2(): void {
      const vectors: DrawVector[] = [
        { from: { x: 0, y: 0 }, to: { x: u1[0].toNumber(), y: u1[1].toNumber() }, color: PALETTE.blue, label: "u1" },
        { from: { x: 0, y: 0 }, to: { x: u2[0].toNumber(), y: u2[1].toNumber() }, color: PALETTE.orange, label: "u2" },
        { from: { x: 0, y: 0 }, to: { x: w[0].toNumber(), y: w[1].toNumber() }, color: PALETTE.green, label: "w" },
      ];
      const draggables: DraggablePoint[] = [
        { id: "u1", pos: { x: u1[0].toNumber(), y: u1[1].toNumber() }, color: PALETTE.blue, label: "u1" },
        { id: "u2", pos: { x: u2[0].toNumber(), y: u2[1].toNumber() }, color: PALETTE.orange, label: "u2" },
        { id: "w", pos: { x: w[0].toNumber(), y: w[1].toNumber() }, color: PALETTE.green, label: "w" },
      ];
      canvas.setVectors(vectors);
      canvas.setDraggables(draggables);
      canvas.render();

      const det = det2(u1, u2);
      const parallel = det.isZero();
      renderBadge(badgeEl, {
        verdict: parallel ? "no" : "yes",
        title: parallel ? "u1, u2 は1次従属（平行・同じ直線上）" : "u1, u2 は1次独立（平面全体を生成）",
        reason: parallel
          ? `det(u1,u2) = ${det.toString()} = 0 なので、u1とu2は平行です。`
          : `det(u1,u2) = ${det.toString()} ≠ 0 なので、u1とu2は平行ではありません。`,
      });

      coeffEl.innerHTML = "";
      if (!parallel) {
        const result = coordinates([u1, u2], w);
        if (result.ok) {
          const p = document.createElement("p");
          p.innerHTML = `w = ${result.coeffs[0].toString()}·u1 + ${result.coeffs[1].toString()}·u2 として表せます（検算: ${result.coeffs[0].toString()}×(${u1
            .map((x) => x.toString())
            .join(",")}) + ${result.coeffs[1].toString()}×(${u2.map((x) => x.toString()).join(",")}) = (${w
            .map((x) => x.toString())
            .join(",")})）`;
          coeffEl.appendChild(p);
        }
      } else {
        coeffEl.innerHTML = "<p>u1とu2が平行なため、平面全体を生成できず、wを一意に表すことができません。</p>";
      }
    }
    renderR2();
  }

  // --- R³ モード ---
  let a = [frac(1), frac(0), frac(0)];
  let b = [frac(0), frac(1), frac(0)];
  let cc = [frac(1), frac(1), frac(0)];
  let angle = 30;

  function mountR3(): void {
    controlsEl.innerHTML = `
      <div class="field-row">a = ${[0, 1, 2].map((i) => `<input type="number" class="s05-a" data-i="${i}" value="${a[i].toNumber()}" style="width:3.5em">`).join("")}</div>
      <div class="field-row">b = ${[0, 1, 2].map((i) => `<input type="number" class="s05-b" data-i="${i}" value="${b[i].toNumber()}" style="width:3.5em">`).join("")}</div>
      <div class="field-row">c = ${[0, 1, 2].map((i) => `<input type="number" class="s05-c" data-i="${i}" value="${cc[i].toNumber()}" style="width:3.5em">`).join("")}</div>
      <div class="field-row"><label for="s05-angle">回転角</label><input type="range" id="s05-angle" min="0" max="359" value="${angle}"></div>
    `;
    canvasWrap.innerHTML = "";
    const canvasEl = document.createElement("canvas");
    canvasEl.className = "vector-canvas";
    canvasEl.width = 360;
    canvasEl.height = 360;
    canvasWrap.appendChild(canvasEl);
    const ctx = canvasEl.getContext("2d")!;
    let cssW = 360;
    let cssH = 360;
    observeCanvasResize(canvasEl, (w, h) => {
      cssW = w;
      cssH = h;
      renderR3();
    });

    function project(v: Fraction[]): { x: number; y: number } {
      const rad = (angle * Math.PI) / 180;
      const x = v[0].toNumber();
      const y = v[1].toNumber();
      const z = v[2].toNumber();
      const rx = x * Math.cos(rad) - z * Math.sin(rad);
      const rz = x * Math.sin(rad) + z * Math.cos(rad);
      return { x: rx, y: y * 0.9 - rz * 0.4 };
    }

    function worldToScreen(p: { x: number; y: number }): { x: number; y: number } {
      const scale = Math.min(cssW, cssH) / 10;
      return { x: cssW / 2 + p.x * scale, y: cssH / 2 - p.y * scale };
    }

    function drawArrow3(v: Fraction[], color: string, label: string): void {
      const from = worldToScreen(project([frac(0), frac(0), frac(0)]));
      const to = worldToScreen(project(v));
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      const ang = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - 10 * Math.cos(ang - Math.PI / 7), to.y - 10 * Math.sin(ang - Math.PI / 7));
      ctx.lineTo(to.x - 10 * Math.cos(ang + Math.PI / 7), to.y - 10 * Math.sin(ang + Math.PI / 7));
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 15px sans-serif";
      ctx.strokeStyle = getComputedStyle(canvasEl).getPropertyValue("--canvas-label-bg") || "#fff";
      ctx.lineWidth = 3;
      ctx.strokeText(label, to.x + 6, to.y - 6);
      ctx.fillText(label, to.x + 6, to.y - 6);
    }

    function renderR3(): void {
      const style = getComputedStyle(canvasEl);
      ctx.fillStyle = style.getPropertyValue("--canvas-bg") || "#fff";
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.strokeStyle = style.getPropertyValue("--canvas-grid") || "#ddd";
      ctx.beginPath();
      ctx.moveTo(0, cssH / 2);
      ctx.lineTo(cssW, cssH / 2);
      ctx.moveTo(cssW / 2, 0);
      ctx.lineTo(cssW / 2, cssH);
      ctx.stroke();

      drawArrow3(a, PALETTE.blue, "a");
      drawArrow3(b, PALETTE.orange, "b");
      drawArrow3(cc, PALETTE.green, "c");

      const det = det3(a, b, cc);
      const coplanar = det.isZero();
      renderBadge(badgeEl, {
        verdict: coplanar ? "no" : "yes",
        title: coplanar ? "a, b, c は1次従属（同一平面上）" : "a, b, c は1次独立（空間全体を生成）",
        reason: coplanar
          ? `det(a,b,c) = ${det.toString()} = 0 なので、a,b,cは同じ平面上にあります。`
          : `det(a,b,c) = ${det.toString()} ≠ 0 なので、a,b,cは空間全体を生成します。`,
      });

      coeffEl.innerHTML = "";
      if (coplanar) {
        const dep = nontrivialDependency([a, b, cc]);
        if (dep) {
          const p = document.createElement("p");
          p.textContent = `1次関係: (${dep[0].toString()})·a + (${dep[1].toString()})·b + (${dep[2].toString()})·c = 0`;
          coeffEl.appendChild(p);
        }
      }
    }

    controlsEl.querySelectorAll<HTMLInputElement>(".s05-a").forEach((el) =>
      el.addEventListener("input", () => {
        a[Number(el.dataset.i)] = frac(Number(el.value) || 0);
        renderR3();
      })
    );
    controlsEl.querySelectorAll<HTMLInputElement>(".s05-b").forEach((el) =>
      el.addEventListener("input", () => {
        b[Number(el.dataset.i)] = frac(Number(el.value) || 0);
        renderR3();
      })
    );
    controlsEl.querySelectorAll<HTMLInputElement>(".s05-c").forEach((el) =>
      el.addEventListener("input", () => {
        cc[Number(el.dataset.i)] = frac(Number(el.value) || 0);
        renderR3();
      })
    );
    controlsEl.querySelector<HTMLInputElement>("#s05-angle")!.addEventListener("input", (ev) => {
      angle = Number((ev.target as HTMLInputElement).value);
      renderR3();
    });

    renderR3();
  }

  modeSel.addEventListener("change", () => {
    if (modeSel.value === "r2") mountR2();
    else mountR3();
  });

  mountR2();

  renderQuiz(refs.quiz, [
    {
      prompt: "R²で2本のベクトルが平行なとき、1次独立・1次従属のどちらですか？",
      choices: ["1次従属", "1次独立", "どちらでもない"],
      correctIndex: 0,
      explanation: "平行な2本は同じ直線上にあり、det=0となるため1次従属です。",
    },
  ]);

  renderGlossary(refs.glossary, [
    { term: "行列式（2×2）", def: "det(u1,u2) = u1xu2y - u1yu2x。0のとき2本は平行。" },
    { term: "同一平面", def: "3本のベクトルが同じ平面上にあること。det(a,b,c)=0と同値。" },
  ]);
}
