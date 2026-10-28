/**
 * 行列を「左右に括弧付き」で表示する共通コンポーネント（指示書 §4.4）。
 * ピボット（主成分）は太枠＋色、変形した行はハイライトして表示する。
 */
import { Fraction } from "../math/fraction.js";
export interface MatrixViewOptions {
    highlightRows?: number[];
    pivotCells?: Array<{
        row: number;
        col: number;
    }>;
    augmentedAfterCol?: number;
    caption?: string;
}
export declare function renderMatrix(container: HTMLElement, m: Fraction[][], opts?: MatrixViewOptions): void;
/** ベクトル（縦ベクトル1列の行列として）を表示する簡易ヘルパー。 */
export declare function renderColumnVector(container: HTMLElement, v: Fraction[], opts?: MatrixViewOptions): void;
