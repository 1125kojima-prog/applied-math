/**
 * ベクトルを描く Canvas 共通コンポーネント。
 * 視認性要件（指示書 §4.3）: 太い矢印・三角の先端・薄い格子線・濃い軸・
 * 目盛りの数字・ラベルの重なり回避・状態変化のアニメーション。
 * 操作要件（§4.5）: pointer イベントでマウス/タッチ両対応、touch-action:none。
 */
import { prefersReducedMotion } from "./theme.js";

export interface Point2 {
  x: number;
  y: number;
}

export interface DrawVector {
  from: Point2;
  to: Point2;
  color: string;
  label: string;
  width?: number;
}

export interface DraggablePoint {
  id: string;
  pos: Point2;
  color: string;
  label: string;
  radius?: number;
}

export interface VectorCanvasOptions {
  range: number; // 原点から見える範囲（-range 〜 range）
  onDrag?: (id: string, pos: Point2) => void;
  snapGrid?: number; // ドラッグ位置をこの間隔にスナップする（0なら無効）
}

/**
 * canvas のCSS表示サイズ（論理ピクセル）に devicePixelRatio を掛けた解像度で
 * バッファを確保し、描画コンテキストをその分だけ拡大しておくことで、
 * 線や文字を実ピクセルでくっきり表示する。表示サイズが変わるたびに自動で追従する。
 * （devicePixelRatio 自体の変化＝表示サイズは変わらないブラウザズームやモニター間
 * 移動には追従しない。対応するにはより重い監視が必要なためここでは対象外とした。）
 */
export function observeCanvasResize(
  canvas: HTMLCanvasElement,
  onResize: (cssWidth: number, cssHeight: number) => void
): ResizeObserver {
  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(rect.width));
    const cssHeight = Math.max(1, Math.round(rect.height));
    const dpr = window.devicePixelRatio || 1;
    const pxWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pxHeight = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== pxWidth || canvas.height !== pxHeight) {
      canvas.width = pxWidth;
      canvas.height = pxHeight;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize(cssWidth, cssHeight);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize(); // ResizeObserverの初回通知は非同期なので、即座に一度実行して初期描画の乱れを防ぐ
  return ro;
}

/** 色覚多様性に配慮した Okabe-Ito パレット（指示書 §4.2）。 */
export const PALETTE = {
  blue: "#0072B2",
  orange: "#E69F00",
  green: "#009E73",
  vermillion: "#D55E00",
  purple: "#CC79A7",
};

export class VectorCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private range: number;
  private draggables: DraggablePoint[] = [];
  private hoveredId: string | null = null;
  private activeId: string | null = null;
  private onDrag?: (id: string, pos: Point2) => void;
  private snapGrid: number;
  private vectors: DrawVector[] = [];
  private extraLabels: Array<{ pos: Point2; text: string; color: string }> = [];
  private extraLines: Array<{ from: Point2; to: Point2; color: string; width?: number }> = [];
  /** CSS上の表示サイズ（論理ピクセル）。座標計算はすべてこの値を基準にし、
   *  実際のバッファ解像度（canvas.width/height）は devicePixelRatio 倍にして
   *  線や文字をくっきり描く（視認性要件）。 */
  private cssW = 0;
  private cssH = 0;

  constructor(canvas: HTMLCanvasElement, opts: VectorCanvasOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new RangeError("2D描画コンテキストを取得できません");
    this.ctx = ctx;
    this.range = opts.range;
    this.onDrag = opts.onDrag;
    this.snapGrid = opts.snapGrid ?? 0;
    this.canvas.style.touchAction = "none";
    this.bindPointerEvents();
    observeCanvasResize(this.canvas, (w, h) => {
      this.cssW = w;
      this.cssH = h;
      this.render();
    });
  }

  setDraggables(points: DraggablePoint[]): void {
    this.draggables = points;
  }

  setVectors(vectors: DrawVector[]): void {
    this.vectors = vectors;
  }

  setExtraLabels(labels: Array<{ pos: Point2; text: string; color: string }>): void {
    this.extraLabels = labels;
  }

  /** 基底で作られる格子（平行線の網）など、補助的な線を描く（S09で使用）。 */
  setExtraLines(lines: Array<{ from: Point2; to: Point2; color: string; width?: number }>): void {
    this.extraLines = lines;
  }

  private worldToScreen(p: Point2): Point2 {
    const w = this.cssW;
    const h = this.cssH;
    const scale = Math.min(w, h) / (2 * this.range);
    return { x: w / 2 + p.x * scale, y: h / 2 - p.y * scale };
  }

  private screenToWorld(p: Point2): Point2 {
    const w = this.cssW;
    const h = this.cssH;
    const scale = Math.min(w, h) / (2 * this.range);
    return { x: (p.x - w / 2) / scale, y: -(p.y - h / 2) / scale };
  }

  private getCanvasPos(ev: PointerEvent): Point2 {
    const rect = this.canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  private bindPointerEvents(): void {
    this.canvas.addEventListener("pointerdown", (ev) => {
      const pos = this.getCanvasPos(ev);
      const hit = this.hitTest(pos);
      if (hit) {
        this.activeId = hit;
        this.canvas.setPointerCapture(ev.pointerId);
        this.render();
      }
    });
    this.canvas.addEventListener("pointermove", (ev) => {
      const pos = this.getCanvasPos(ev);
      if (this.activeId) {
        let world = this.screenToWorld(pos);
        world = this.clampToRange(world);
        if (this.snapGrid > 0) {
          world = {
            x: Math.round(world.x / this.snapGrid) * this.snapGrid,
            y: Math.round(world.y / this.snapGrid) * this.snapGrid,
          };
        }
        const dp = this.draggables.find((d) => d.id === this.activeId);
        if (dp) dp.pos = world;
        this.onDrag?.(this.activeId, world);
        this.render();
      } else {
        const hit = this.hitTest(pos);
        if (hit !== this.hoveredId) {
          this.hoveredId = hit;
          this.render();
        }
      }
    });
    const release = () => {
      this.activeId = null;
      this.render();
    };
    this.canvas.addEventListener("pointerup", release);
    this.canvas.addEventListener("pointercancel", release);
    this.canvas.addEventListener("pointerleave", () => {
      this.hoveredId = null;
      if (!this.activeId) this.render();
    });
  }

  private clampToRange(p: Point2): Point2 {
    const r = this.range * 0.98;
    return { x: Math.max(-r, Math.min(r, p.x)), y: Math.max(-r, Math.min(r, p.y)) };
  }

  private hitTest(screenPos: Point2): string | null {
    for (const d of this.draggables) {
      const s = this.worldToScreen(d.pos);
      const r = (d.radius ?? 10) + 6;
      const dx = s.x - screenPos.x;
      const dy = s.y - screenPos.y;
      if (dx * dx + dy * dy <= r * r) return d.id;
    }
    return null;
  }

  /** 格子・軸・目盛りを描く。 */
  private drawGrid(): void {
    const ctx = this.ctx;
    const w = this.cssW;
    const h = this.cssH;
    const style = getComputedStyle(this.canvas);
    const gridColor = style.getPropertyValue("--canvas-grid").trim() || "#ddd";
    const axisColor = style.getPropertyValue("--canvas-axis").trim() || "#333";
    const textColor = style.getPropertyValue("--canvas-text").trim() || "#111";

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    for (let i = -Math.ceil(this.range); i <= Math.ceil(this.range); i++) {
      const p1 = this.worldToScreen({ x: i, y: -this.range });
      const p2 = this.worldToScreen({ x: i, y: this.range });
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      const q1 = this.worldToScreen({ x: -this.range, y: i });
      const q2 = this.worldToScreen({ x: this.range, y: i });
      ctx.moveTo(q1.x, q1.y);
      ctx.lineTo(q2.x, q2.y);
    }
    ctx.stroke();

    // 軸
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const xAxis1 = this.worldToScreen({ x: -this.range, y: 0 });
    const xAxis2 = this.worldToScreen({ x: this.range, y: 0 });
    ctx.moveTo(xAxis1.x, xAxis1.y);
    ctx.lineTo(xAxis2.x, xAxis2.y);
    const yAxis1 = this.worldToScreen({ x: 0, y: -this.range });
    const yAxis2 = this.worldToScreen({ x: 0, y: this.range });
    ctx.moveTo(yAxis1.x, yAxis1.y);
    ctx.lineTo(yAxis2.x, yAxis2.y);
    ctx.stroke();

    // 目盛りの数字
    ctx.fillStyle = textColor;
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = -Math.ceil(this.range) + 1; i < Math.ceil(this.range); i++) {
      if (i === 0) continue;
      const p = this.worldToScreen({ x: i, y: 0 });
      ctx.fillText(String(i), p.x, p.y + 4);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = -Math.ceil(this.range) + 1; i < Math.ceil(this.range); i++) {
      if (i === 0) continue;
      const p = this.worldToScreen({ x: 0, y: i });
      ctx.fillText(String(i), p.x + 4, p.y);
    }
  }

  private drawArrow(v: DrawVector): void {
    const ctx = this.ctx;
    const from = this.worldToScreen(v.from);
    const to = this.worldToScreen(v.to);
    const width = v.width ?? 3;
    ctx.strokeStyle = v.color;
    ctx.fillStyle = v.color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 7), to.y - headLen * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 7), to.y - headLen * Math.sin(angle + Math.PI / 7));
    ctx.closePath();
    ctx.fill();
  }

  /** 矢印の先端近くにラベルを置く。既存のラベルと重なる場合は少しずらす。 */
  private drawLabels(items: Array<{ anchor: Point2; text: string; color: string }>): void {
    const ctx = this.ctx;
    ctx.font = "bold 16px sans-serif";
    const placed: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (const item of items) {
      const metrics = ctx.measureText(item.text);
      const w = metrics.width + 6;
      const h = 20;
      let x = item.anchor.x + 10;
      let y = item.anchor.y - 10;
      let tries = 0;
      while (placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 && Math.abs(p.y - y) < (p.h + h) / 2) && tries < 8) {
        y -= h * 0.9;
        tries++;
      }
      placed.push({ x, y, w, h });
      // 背景（可読性のための縁取り）
      ctx.lineWidth = 3;
      ctx.strokeStyle = getComputedStyle(this.canvas).getPropertyValue("--canvas-label-bg").trim() || "#ffffff";
      ctx.strokeText(item.text, x, y);
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, x, y);
    }
  }

  render(): void {
    this.drawGrid();
    for (const line of this.extraLines) {
      const from = this.worldToScreen(line.from);
      const to = this.worldToScreen(line.to);
      this.ctx.strokeStyle = line.color;
      this.ctx.lineWidth = line.width ?? 1;
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();
    }
    for (const v of this.vectors) this.drawArrow(v);
    const labelItems = this.vectors.map((v) => ({ anchor: this.worldToScreen(v.to), text: v.label, color: v.color }));
    for (const el of this.extraLabels) {
      labelItems.push({ anchor: this.worldToScreen(el.pos), text: el.text, color: el.color });
    }
    this.drawLabels(labelItems);

    for (const d of this.draggables) {
      const s = this.worldToScreen(d.pos);
      const base = d.radius ?? 7;
      const r = this.activeId === d.id || this.hoveredId === d.id ? base * 1.5 : base;
      this.ctx.beginPath();
      this.ctx.fillStyle = d.color;
      this.ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      if (this.hoveredId === d.id || this.activeId === d.id) {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = getComputedStyle(this.canvas).getPropertyValue("--focus-ring").trim() || "#000";
        this.ctx.stroke();
      }
    }
  }
}

/**
 * 数値の配列を 0.3〜0.6秒でアニメーションさせる。
 * prefers-reduced-motion のときは即時に終了状態へ切り替える。
 */
export function animateValues(
  from: number[],
  to: number[],
  onUpdate: (values: number[]) => void,
  durationMs = 400
): void {
  if (prefersReducedMotion()) {
    onUpdate(to);
    return;
  }
  const start = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    const values = from.map((v, i) => v + (to[i] - v) * eased);
    onUpdate(values);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
