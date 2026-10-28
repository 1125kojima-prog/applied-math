/**
 * 「最初から／前へ／次へ／自動再生」でステップを進める共通コンポーネント。
 * 掃き出し法（S02）やランクの最大独立組の抽出（S07）で使う。
 */
export interface StepperCallbacks {
    onStepChange: (index: number, total: number) => void;
}
export declare class Stepper {
    private index;
    private total;
    private playing;
    private timer;
    private callbacks;
    private root;
    constructor(container: HTMLElement, total: number, callbacks: StepperCallbacks);
    setTotal(total: number): void;
    private buildUi;
    private counterEl;
    private togglePlay;
    private stopPlay;
    goTo(index: number): void;
    getIndex(): number;
    private emit;
}
