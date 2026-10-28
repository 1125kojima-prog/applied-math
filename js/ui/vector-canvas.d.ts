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
    range: number;
    onDrag?: (id: string, pos: Point2) => void;
    snapGrid?: number;
}
/**
 * canvas のCSS表示サイズ（論理ピクセル）に devicePixelRatio を掛けた解像度で
 * バッファを確保し、描画コンテキストをその分だけ拡大しておくことで、
 * 線や文字を実ピクセルでくっきり表示する。表示サイズが変わるたびに自動で追従する。
 * （devicePixelRatio 自体の変化＝表示サイズは変わらないブラウザズームやモニター間
 * 移動には追従しない。対応するにはより重い監視が必要なためここでは対象外とした。）
 */
export declare function observeCanvasResize(canvas: HTMLCanvasElement, onResize: (cssWidth: number, cssHeight: number) => void): ResizeObserver;
/** 色覚多様性に配慮した Okabe-Ito パレット（指示書 §4.2）。 */
export declare const PALETTE: {
    blue: string;
    orange: string;
    green: string;
    vermillion: string;
    purple: string;
};
export declare class VectorCanvas {
    private canvas;
    private ctx;
    private range;
    private draggables;
    private hoveredId;
    private activeId;
    private onDrag?;
    private snapGrid;
    private vectors;
    private extraLabels;
    private extraLines;
    /** CSS上の表示サイズ（論理ピクセル）。座標計算はすべてこの値を基準にし、
     *  実際のバッファ解像度（canvas.width/height）は devicePixelRatio 倍にして
     *  線や文字をくっきり描く（視認性要件）。 */
    private cssW;
    private cssH;
    constructor(canvas: HTMLCanvasElement, opts: VectorCanvasOptions);
    setDraggables(points: DraggablePoint[]): void;
    setVectors(vectors: DrawVector[]): void;
    setExtraLabels(labels: Array<{
        pos: Point2;
        text: string;
        color: string;
    }>): void;
    /** 基底で作られる格子（平行線の網）など、補助的な線を描く（S09で使用）。 */
    setExtraLines(lines: Array<{
        from: Point2;
        to: Point2;
        color: string;
        width?: number;
    }>): void;
    private worldToScreen;
    private screenToWorld;
    private getCanvasPos;
    private bindPointerEvents;
    private clampToRange;
    private hitTest;
    /** 格子・軸・目盛りを描く。 */
    private drawGrid;
    private drawArrow;
    /** 矢印の先端近くにラベルを置く。既存のラベルと重なる場合は少しずらす。 */
    private drawLabels;
    render(): void;
}
/**
 * 数値の配列を 0.3〜0.6秒でアニメーションさせる。
 * prefers-reduced-motion のときは即時に終了状態へ切り替える。
 */
export declare function animateValues(from: number[], to: number[], onUpdate: (values: number[]) => void, durationMs?: number): void;
