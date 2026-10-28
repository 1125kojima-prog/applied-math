/**
 * S01 部分空間の判定器（第2回 p.24-29）
 * 6種類の集合について、定理4.1.1の3条件（0∈W, 和で閉じる, スカラー倍で閉じる）を
 * 体験的に確認する。R^2 の集合はCanvas上でu,vをドラッグでき、R[x]3 の集合は
 * 係数を数値入力で操作する。
 *
 * 要確認（指示書との食い違い・PDF確認結果）:
 * 指示書では「W={f∈R[x]3 | f(1)=0}」単独の条件とされていたが、
 * PDF（例題4.1.3(1), p.27）では実際には「f(1)=0 かつ f(-1)=0」の2条件である。
 * ここではPDFの記載（2条件版）を正とした。
 */
import { Fraction, frac } from "../math/fraction.js";
import { zeroVec, vecAdd, vecScale, polyEval, polyToLatex } from "../math/linalg.js";
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge, renderConditionList, Verdict } from "../ui/badge.js";
import { VectorCanvas, PALETTE, DraggablePoint, DrawVector } from "../ui/vector-canvas.js";
import { renderMath } from "../ui/katex-loader.js";

type Kind = "r2" | "poly3";

interface SubspaceCase {
  id: string;
  label: string;
  kind: Kind;
  defText: string; // KaTeX
  membership: (v: Fraction[]) => boolean;
  isSubspace: boolean;
  reason: string;
  violated: 1 | 2 | 3 | null;
  counterexample?: { u: number[]; v?: number[]; c?: number };
  sampleInW: () => number[];
  note?: string;
}

const CASES: SubspaceCase[] = [
  {
    id: "c1",
    label: "① W = { x∈R² | x1+x2=0 }",
    kind: "r2",
    defText: "W=\\{x\\in\\mathbb{R}^2 \\mid x_1+x_2=0\\}",
    membership: (v) => v[0].add(v[1]).isZero(),
    isSubspace: true,
    reason: "0∈W、u+v∈W、cu∈W がすべて成り立つため部分空間です（定理4.1.1）。",
    violated: null,
    sampleInW: () => {
      const x1 = Math.round(Math.random() * 6 - 3);
      return [x1, -x1];
    },
  },
  {
    id: "c2",
    label: "② W = { x∈R² | x1+x2=1 }",
    kind: "r2",
    defText: "W=\\{x\\in\\mathbb{R}^2 \\mid x_1+x_2=1\\}",
    membership: (v) => v[0].add(v[1]).equals(frac(1)),
    isSubspace: false,
    reason: "零ベクトル 0=(0,0) は 0+0=0≠1 なので W に属しません（0∉W）。したがって部分空間ではありません。",
    violated: 1,
    sampleInW: () => {
      const x1 = Math.round(Math.random() * 6 - 3);
      return [x1, 1 - x1];
    },
  },
  {
    id: "c3",
    label: "③ W = { x∈R² | −1≤x1≤1, −1≤x2≤1 }",
    kind: "r2",
    defText: "W=\\{x\\in\\mathbb{R}^2 \\mid -1\\le x_1\\le 1,\\ -1\\le x_2\\le 1\\}",
    membership: (v) => v[0].abs().toNumber() <= 1 && v[1].abs().toNumber() <= 1,
    isSubspace: false,
    reason: "u=(1,1), v=(1,1) はどちらもWに属しますが、u+v=(2,2) はWの外に出ます。和で閉じていないため部分空間ではありません。",
    violated: 2,
    counterexample: { u: [1, 1], v: [1, 1] },
    sampleInW: () => [Math.round(Math.random() * 2 - 1), Math.round(Math.random() * 2 - 1)],
  },
  {
    id: "c4",
    label: "④ W = { f∈R[x]₃ | f(1)=0 かつ f(−1)=0 }",
    kind: "poly3",
    defText: "W=\\{f\\in \\mathbb{R}[x]_3 \\mid f(1)=0,\\ f(-1)=0\\}",
    membership: (v) => polyEval(v, frac(1)).isZero() && polyEval(v, frac(-1)).isZero(),
    isSubspace: true,
    reason: "f(1)=0 かつ f(-1)=0 は a0,a1,a2,a3 についての斉次1次方程式なので、0∈W・和で閉じる・スカラー倍で閉じる がすべて成り立ち、部分空間です。",
    violated: null,
    sampleInW: () => {
      const a2 = Math.round(Math.random() * 4 - 2);
      const a3 = Math.round(Math.random() * 4 - 2);
      return [-a2, -a3, a2, a3];
    },
    note: "要確認: 指示書では「f(1)=0」単独の条件だったが、PDF（例題4.1.3(1), p.27）では「f(1)=0 かつ f(-1)=0」の2条件だったため、ここではPDFの記載に合わせた。",
  },
  {
    id: "c5",
    label: "⑤ W = { f∈R[x]₃ | f(1)=1 }",
    kind: "poly3",
    defText: "W=\\{f\\in \\mathbb{R}[x]_3 \\mid f(1)=1\\}",
    membership: (v) => polyEval(v, frac(1)).equals(frac(1)),
    isSubspace: false,
    reason: "零多項式 f=0 は f(1)=0≠1 なので W に属しません（0∉W）。したがって部分空間ではありません。",
    violated: 1,
    sampleInW: () => {
      const a1 = Math.round(Math.random() * 4 - 2);
      const a2 = Math.round(Math.random() * 4 - 2);
      const a3 = Math.round(Math.random() * 4 - 2);
      return [1 - a1 - a2 - a3, a1, a2, a3];
    },
  },
  {
    id: "c6",
    label: "⑥ W = { f∈R[x]₃ | x f'(x) = 2f(x) }",
    kind: "poly3",
    defText: "W=\\{f\\in \\mathbb{R}[x]_3 \\mid x f'(x)=2f(x)\\}",
    membership: (v) => v.every((a, k) => frac(k - 2).mul(a).isZero()),
    isSubspace: true,
    reason: "各次数kについて (k−2)a_k=0 という斉次1次条件（k=2のときのみ自由）なので部分空間です。実は W={a·x² | a∈R} の1次元部分空間です。",
    violated: null,
    sampleInW: () => [0, 0, Math.round(Math.random() * 4 - 2), 0],
  },
];

function toFracVec(nums: number[]): Fraction[] {
  return nums.map((n) => frac(n));
}

export function mountS01(container: HTMLElement): void {
  const refs = createSimLayout(container, {
    title: "S01 部分空間の判定器",
    page: "p.24–29",
    lecture: "第2回",
    purpose: "集合 W が部分空間かどうかを、定理4.1.1の3条件で判定する。",
    theorems: [{ id: "定理4.1.1", text: "0∈W、u,v∈W⇒u+v∈W、u∈W⇒cu∈W の3条件が部分空間の必要十分条件", page: "p.24" }],
  });

  let currentCase = CASES[0];
  let u: Fraction[] = toFracVec(currentCase.sampleInW());
  let v: Fraction[] = toFracVec(currentCase.sampleInW());
  let c = Fraction.one();

  refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s01-select">対象となる集合:</label>
      <select id="s01-select"></select>
    </div>
    <div id="s01-controls"></div>
    <div class="field-row">
      <button type="button" id="s01-random">ランダムに選ぶ（Wの中の点）</button>
      <button type="button" id="s01-counter" style="display:none">反例を見る</button>
    </div>
  `;
  const select = refs.operation.querySelector<HTMLSelectElement>("#s01-select")!;
  CASES.forEach((c2) => {
    const opt = document.createElement("option");
    opt.value = c2.id;
    opt.textContent = c2.label;
    select.appendChild(opt);
  });

  const controlsEl = refs.operation.querySelector<HTMLElement>("#s01-controls")!;
  const randomBtn = refs.operation.querySelector<HTMLButtonElement>("#s01-random")!;
  const counterBtn = refs.operation.querySelector<HTMLButtonElement>("#s01-counter")!;

  refs.display.innerHTML = `
    <div id="s01-canvas-wrap"></div>
    <div id="s01-formula"></div>
    <h4>条件チェック（現在の u, v, c について）</h4>
    <div id="s01-conditions"></div>
    <h4>判定</h4>
    <div id="s01-badge"></div>
  `;
  const canvasWrap = refs.display.querySelector<HTMLElement>("#s01-canvas-wrap")!;
  const formulaEl = refs.display.querySelector<HTMLElement>("#s01-formula")!;
  const conditionsEl = refs.display.querySelector<HTMLElement>("#s01-conditions")!;
  const badgeEl = refs.display.querySelector<HTMLElement>("#s01-badge")!;

  let canvas: VectorCanvas | null = null;

  function buildControlsForCase(): void {
    controlsEl.innerHTML = "";
    canvasWrap.innerHTML = "";
    canvas = null;

    if (currentCase.note) {
      const noteP = document.createElement("p");
      noteP.className = "condition-detail";
      noteP.textContent = currentCase.note;
      controlsEl.appendChild(noteP);
    }

    if (currentCase.kind === "r2") {
      const c1 = document.createElement("canvas");
      c1.className = "vector-canvas";
      c1.width = 360;
      c1.height = 360;
      canvasWrap.appendChild(c1);
      canvas = new VectorCanvas(c1, {
        range: 4,
        snapGrid: 1,
        onDrag: (id, pos) => {
          const fv = [frac(Math.round(pos.x)), frac(Math.round(pos.y))];
          if (id === "u") u = fv;
          else if (id === "v") v = fv;
          update();
        },
      });
      const scalarRow = document.createElement("div");
      scalarRow.className = "field-row";
      scalarRow.innerHTML = `<label for="s01-c">スカラー c = <span id="s01-c-val">1</span></label>
        <input type="range" id="s01-c" min="-3" max="3" step="1" value="1" />`;
      controlsEl.appendChild(scalarRow);
      scalarRow.querySelector<HTMLInputElement>("#s01-c")!.addEventListener("input", (ev) => {
        const val = Number((ev.target as HTMLInputElement).value);
        c = frac(val);
        scalarRow.querySelector("#s01-c-val")!.textContent = String(val);
        update();
      });
    } else {
      controlsEl.innerHTML = `
        <p>多項式 u, v の係数（a0 + a1x + a2x² + a3x³）を入力してください。</p>
        <div class="field-row">u: ${[0, 1, 2, 3]
          .map((k) => `<input type="number" id="s01-u${k}" value="0" style="width:4em" aria-label="uのx^${k}の係数">`)
          .join("")}</div>
        <div class="field-row">v: ${[0, 1, 2, 3]
          .map((k) => `<input type="number" id="s01-v${k}" value="0" style="width:4em" aria-label="vのx^${k}の係数">`)
          .join("")}</div>
        <div class="field-row">
          <label for="s01-c">スカラー c = <span id="s01-c-val">1</span></label>
          <input type="range" id="s01-c" min="-3" max="3" step="1" value="1" />
        </div>
      `;
      [0, 1, 2, 3].forEach((k) => {
        controlsEl.querySelector<HTMLInputElement>(`#s01-u${k}`)!.addEventListener("input", (ev) => {
          u[k] = frac(Number((ev.target as HTMLInputElement).value) || 0);
          update();
        });
        controlsEl.querySelector<HTMLInputElement>(`#s01-v${k}`)!.addEventListener("input", (ev) => {
          v[k] = frac(Number((ev.target as HTMLInputElement).value) || 0);
          update();
        });
      });
      controlsEl.querySelector<HTMLInputElement>("#s01-c")!.addEventListener("input", (ev) => {
        const val = Number((ev.target as HTMLInputElement).value);
        c = frac(val);
        controlsEl.querySelector("#s01-c-val")!.textContent = String(val);
        update();
      });
    }
    counterBtn.style.display = currentCase.isSubspace ? "none" : "inline-block";
  }

  function syncPolyInputs(): void {
    if (currentCase.kind !== "poly3") return;
    [0, 1, 2, 3].forEach((k) => {
      const uInput = controlsEl.querySelector<HTMLInputElement>(`#s01-u${k}`);
      const vInput = controlsEl.querySelector<HTMLInputElement>(`#s01-v${k}`);
      if (uInput) uInput.value = u[k].toNumber().toString();
      if (vInput) vInput.value = v[k].toNumber().toString();
    });
  }

  function update(): void {
    const dim = currentCase.kind === "r2" ? 2 : 4;
    const zero = zeroVec(dim);
    const sum = vecAdd(u, v);
    const scaled = vecScale(c, u);

    const uIn = currentCase.membership(u);
    const vIn = currentCase.membership(v);
    const zeroIn = currentCase.membership(zero);
    const sumIn = currentCase.membership(sum);
    const scaledIn = currentCase.membership(scaled);

    if (currentCase.kind === "r2" && canvas) {
      const vectors: DrawVector[] = [
        { from: { x: 0, y: 0 }, to: { x: u[0].toNumber(), y: u[1].toNumber() }, color: PALETTE.blue, label: "u" },
        { from: { x: 0, y: 0 }, to: { x: v[0].toNumber(), y: v[1].toNumber() }, color: PALETTE.orange, label: "v" },
        {
          from: { x: 0, y: 0 },
          to: { x: sum[0].toNumber(), y: sum[1].toNumber() },
          color: PALETTE.green,
          label: "u+v",
        },
        {
          from: { x: 0, y: 0 },
          to: { x: scaled[0].toNumber(), y: scaled[1].toNumber() },
          color: PALETTE.purple,
          label: "cu",
        },
      ];
      const draggables: DraggablePoint[] = [
        { id: "u", pos: { x: u[0].toNumber(), y: u[1].toNumber() }, color: PALETTE.blue, label: "u" },
        { id: "v", pos: { x: v[0].toNumber(), y: v[1].toNumber() }, color: PALETTE.orange, label: "v" },
      ];
      canvas.setVectors(vectors);
      canvas.setDraggables(draggables);
      canvas.render();
      formulaEl.innerHTML = `<span data-katex="${currentCase.defText}"></span>`;
    } else {
      syncPolyInputs();
      formulaEl.innerHTML = `
        <p><span data-katex="${currentCase.defText}"></span></p>
        <p>u(x) = <span data-katex="${polyToLatex(u)}"></span>　v(x) = <span data-katex="${polyToLatex(v)}"></span></p>
        <p>u+v = <span data-katex="${polyToLatex(sum)}"></span>　c·u = <span data-katex="${polyToLatex(scaled)}"></span></p>
      `;
    }

    renderConditionList(conditionsEl, [
      { label: "0 ∈ W", ok: zeroIn },
      {
        label: "u, v ∈ W ⇒ u+v ∈ W",
        ok: !(uIn && vIn) ? true : sumIn,
        detail: !(uIn && vIn)
          ? "u または v が W に属していないため、この入力では検証できません（ランダムに選ぶ、で W 内の点を選んでください）。"
          : sumIn
          ? undefined
          : `u+v = (${sum.map((x) => x.toString()).join(", ")}) は W の外に出ました。`,
      },
      {
        label: "u ∈ W ⇒ cu ∈ W",
        ok: !uIn ? true : scaledIn,
        detail: !uIn
          ? "u が W に属していないため、この入力では検証できません。"
          : scaledIn
          ? undefined
          : `c·u = (${scaled.map((x) => x.toString()).join(", ")}) は W の外に出ました。`,
      },
    ]);

    const verdict: Verdict = currentCase.isSubspace ? "yes" : "no";
    renderBadge(badgeEl, {
      verdict,
      title: currentCase.isSubspace ? "部分空間である" : "部分空間ではない",
      reason: currentCase.reason,
    });

    renderMath(formulaEl.querySelector("[data-katex]") as HTMLElement, currentCase.defText);
    formulaEl.querySelectorAll<HTMLElement>("[data-katex]").forEach((el) => {
      renderMath(el, el.getAttribute("data-katex") ?? "");
    });
  }

  select.addEventListener("change", () => {
    currentCase = CASES.find((c2) => c2.id === select.value) ?? CASES[0];
    u = toFracVec(currentCase.sampleInW());
    v = toFracVec(currentCase.sampleInW());
    c = Fraction.one();
    buildControlsForCase();
    update();
  });

  randomBtn.addEventListener("click", () => {
    u = toFracVec(currentCase.sampleInW());
    v = toFracVec(currentCase.sampleInW());
    update();
  });

  counterBtn.addEventListener("click", () => {
    if (!currentCase.counterexample) return;
    u = toFracVec(currentCase.counterexample.u);
    if (currentCase.counterexample.v) v = toFracVec(currentCase.counterexample.v);
    update();
  });

  buildControlsForCase();
  update();

  renderQuiz(refs.quiz, [
    {
      prompt: "W = {x∈R² | x1+x2=1} が部分空間でない最大の理由は何ですか？",
      choices: ["0∈Wではないから", "次元が大きすぎるから", "複素数が使えないから"],
      correctIndex: 0,
      explanation: "原点(0,0)が条件x1+x2=1を満たさないため、0∉Wとなり部分空間の条件を満たしません。",
    },
    {
      prompt: "W = {f∈R[x]3 | xf'(x)=2f(x)} はどのような多項式の集合ですか？",
      choices: ["a·x² の形の多項式全体（1次元）", "すべての3次以下の多項式", "定数項が0の多項式全体"],
      correctIndex: 0,
      explanation: "各次数kについて(k-2)a_k=0なので、k=2のときだけ自由。つまりW={a·x²|a∈R}です。",
    },
  ]);

  renderGlossary(refs.glossary, [
    { term: "部分空間", def: "ベクトル空間Vの部分集合Wで、0∈W・和で閉じる・スカラー倍で閉じる の3条件を満たすもの。" },
    { term: "反例", def: "ある命題が偽であることを示す、具体的な1つの例。" },
  ]);
}
