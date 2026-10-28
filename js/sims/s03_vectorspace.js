/**
 * S03 ベクトル空間の8条件チェッカー（第1回 p.21-22）
 *
 * 要確認: 「8条件」の正確な項目分けは講義資料第1回（指示書の参照範囲外）に
 * 依拠するため、ここでは一般的な線形空間の公理（交換律・結合律・零元・逆元・
 * 2種の分配律・スカラー単位律・加法の閉包・スカラー倍の閉包）の8項目を採用した。
 * 実数の通常の演算を使う限り、交換律・結合律・分配律・単位律は自動的に成り立つため、
 * 本シミュレーションが実際に判定しているのは「加法の閉包」「スカラー倍の閉包」
 * 「零元の存在」「逆元の存在」の4項目であり、残り4項目は常に○として表示する。
 */
import { createSimLayout, renderGlossary, renderQuiz } from "../ui/sim-layout.js";
import { renderBadge, renderConditionList } from "../ui/badge.js";
const EPS = 1e-9;
const SPACES = [
    {
        id: "r2",
        label: "R²（実数の組2つ）",
        dim: 2,
        membership: () => true,
        sample: () => [rand(), rand()],
        defaultC: 2,
        componentNames: ["x1", "x2"],
    },
    {
        id: "r3",
        label: "R³（実数の組3つ）",
        dim: 3,
        membership: () => true,
        sample: () => [rand(), rand(), rand()],
        defaultC: 2,
        componentNames: ["x1", "x2", "x3"],
    },
    {
        id: "poly2",
        label: "R[x]₂（2次以下の多項式）",
        dim: 3,
        membership: () => true,
        sample: () => [rand(), rand(), rand()],
        defaultC: 2,
        componentNames: ["a0", "a1", "a2"],
    },
    {
        id: "rplus",
        label: "正の実数全体 R+（通常の加法・実数倍）",
        dim: 1,
        membership: (v) => v[0] > EPS,
        sample: () => [Math.round(Math.random() * 5) + 1],
        defaultC: -1,
        componentNames: ["x"],
    },
    {
        id: "zint",
        label: "整数の集合 ℤ（通常の加法・実数倍）",
        dim: 1,
        membership: (v) => Number.isInteger(v[0]),
        sample: () => [Math.round(Math.random() * 6 - 3)],
        defaultC: 0.5,
        componentNames: ["x"],
    },
];
function rand() {
    return Math.round(Math.random() * 6 - 3);
}
export function mountS03(container) {
    const refs = createSimLayout(container, {
        title: "S03 ベクトル空間の8条件チェッカー",
        page: "p.21-22",
        lecture: "第1回",
        purpose: "集合とその和・スカラー倍が、ベクトル空間の8条件を満たすかを確認する。",
    });
    let space = SPACES[0];
    let u = space.sample();
    let v = space.sample();
    let c = space.defaultC;
    refs.operation.innerHTML = `
    <div class="field-row">
      <label for="s03-select">集合:</label>
      <select id="s03-select">${SPACES.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}</select>
    </div>
    <div id="s03-inputs"></div>
    <div class="field-row">
      <button type="button" id="s03-random">u, v をランダムに選ぶ</button>
    </div>
  `;
    const select = refs.operation.querySelector("#s03-select");
    const inputsEl = refs.operation.querySelector("#s03-inputs");
    refs.display.innerHTML = `<div id="s03-conditions"></div><div id="s03-badge"></div>`;
    const conditionsEl = refs.display.querySelector("#s03-conditions");
    const badgeEl = refs.display.querySelector("#s03-badge");
    function buildInputs() {
        const names = space.componentNames;
        const uInputs = names
            .map((nm, i) => `<input type="number" step="any" class="s03-u" data-i="${i}" value="${u[i]}" style="width:4em" aria-label="uの${nm}">`)
            .join("");
        const vInputs = names
            .map((nm, i) => `<input type="number" step="any" class="s03-v" data-i="${i}" value="${v[i]}" style="width:4em" aria-label="vの${nm}">`)
            .join("");
        inputsEl.innerHTML = `
      <div class="field-row">u (${names.join(",")}) = ${uInputs}</div>
      <div class="field-row">v (${names.join(",")}) = ${vInputs}</div>
      <div class="field-row"><label for="s03-c">スカラー c</label><input type="number" step="any" id="s03-c" value="${c}" style="width:5em"></div>
    `;
        inputsEl.querySelectorAll(".s03-u").forEach((el) => {
            el.addEventListener("input", () => {
                u[Number(el.dataset.i)] = Number(el.value) || 0;
                update();
            });
        });
        inputsEl.querySelectorAll(".s03-v").forEach((el) => {
            el.addEventListener("input", () => {
                v[Number(el.dataset.i)] = Number(el.value) || 0;
                update();
            });
        });
        inputsEl.querySelector("#s03-c").addEventListener("input", (ev) => {
            c = Number(ev.target.value) || 0;
            update();
        });
    }
    function update() {
        const zero = new Array(space.dim).fill(0);
        const sum = u.map((x, i) => x + v[i]);
        const neg = u.map((x) => -x);
        const scaled = u.map((x) => c * x);
        const addClosed = space.membership(sum);
        const scalarClosed = space.membership(scaled);
        const zeroExists = space.membership(zero);
        const inverseExists = space.membership(neg);
        const fmt = (arr) => `(${arr.join(", ")})`;
        renderConditionList(conditionsEl, [
            { label: "加法で閉じている（u+v∈V）", ok: addClosed, detail: addClosed ? undefined : `u+v=${fmt(sum)} はVの外です。` },
            { label: "u+v = v+u （交換法則）", ok: true },
            { label: "(u+v)+w = u+(v+w) （結合法則）", ok: true },
            { label: "零元0が存在し、u+0=u", ok: zeroExists, detail: zeroExists ? undefined : `零元 ${fmt(zero)} がVに属しません。` },
            { label: "各uに逆元-uが存在し、u+(-u)=0", ok: inverseExists, detail: inverseExists ? undefined : `-u=${fmt(neg)} がVの外です。` },
            {
                label: "スカラー倍で閉じている（cu∈V）",
                ok: scalarClosed,
                detail: scalarClosed ? undefined : `c·u=${fmt(scaled)}（c=${c}）はVの外です。`,
            },
            { label: "c(u+v)=cu+cv, (c+d)u=cu+du （分配法則）", ok: true },
            { label: "1·u = u （単位律）", ok: true },
        ]);
        const allOk = addClosed && scalarClosed && zeroExists && inverseExists;
        renderBadge(badgeEl, {
            verdict: allOk ? "yes" : "no",
            title: allOk ? `${space.label} はベクトル空間です` : `${space.label} はベクトル空間ではありません`,
            reason: allOk
                ? "8条件すべてが成り立つため、ベクトル空間です。"
                : "いずれかの条件が崩れているため、ベクトル空間ではありません（上の✗の項目を参照）。",
        });
    }
    select.addEventListener("change", () => {
        space = SPACES.find((s) => s.id === select.value) ?? SPACES[0];
        u = space.sample();
        v = space.sample();
        c = space.defaultC;
        buildInputs();
        update();
    });
    refs.operation.querySelector("#s03-random").addEventListener("click", () => {
        u = space.sample();
        v = space.sample();
        buildInputs();
        update();
    });
    buildInputs();
    update();
    renderQuiz(refs.quiz, [
        {
            prompt: "整数の集合ℤが（通常の加法・実数倍のもとで）ベクトル空間でない理由は？",
            choices: ["スカラー倍で閉じていないから（例: 0.5×1=0.5∉ℤ）", "加法で閉じていないから", "零元が存在しないから"],
            correctIndex: 0,
            explanation: "整数に実数（例えば0.5）を掛けると整数にならない場合があるため、スカラー倍で閉じていません。",
        },
    ]);
    renderGlossary(refs.glossary, [
        { term: "ベクトル空間", def: "和とスカラー倍が定義され、8つの公理を満たす集合。" },
        { term: "閉じている", def: "集合の中の演算結果が、常にその集合の中に収まること。" },
    ]);
}
//# sourceMappingURL=s03_vectorspace.js.map