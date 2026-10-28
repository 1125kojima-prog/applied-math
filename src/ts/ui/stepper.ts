/**
 * 「最初から／前へ／次へ／自動再生」でステップを進める共通コンポーネント。
 * 掃き出し法（S02）やランクの最大独立組の抽出（S07）で使う。
 */
export interface StepperCallbacks {
  onStepChange: (index: number, total: number) => void;
}

export class Stepper {
  private index = 0;
  private total: number;
  private playing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private callbacks: StepperCallbacks;
  private root: HTMLElement;

  constructor(container: HTMLElement, total: number, callbacks: StepperCallbacks) {
    this.total = total;
    this.callbacks = callbacks;
    this.root = container;
    this.buildUi();
    this.emit();
  }

  setTotal(total: number): void {
    this.total = total;
    this.index = Math.min(this.index, Math.max(0, total - 1));
    this.emit();
  }

  private buildUi(): void {
    this.root.innerHTML = "";
    this.root.className = "stepper-bar";

    const first = document.createElement("button");
    first.type = "button";
    first.textContent = "最初から";
    first.addEventListener("click", () => this.goTo(0));

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "◀ 前へ";
    prev.addEventListener("click", () => this.goTo(this.index - 1));

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "次へ ▶";
    next.addEventListener("click", () => this.goTo(this.index + 1));

    const play = document.createElement("button");
    play.type = "button";
    play.textContent = "自動再生 ▶▶";
    play.addEventListener("click", () => this.togglePlay(play));

    const counter = document.createElement("span");
    counter.className = "stepper-counter";
    counter.setAttribute("aria-live", "polite");

    this.root.appendChild(first);
    this.root.appendChild(prev);
    this.root.appendChild(next);
    this.root.appendChild(play);
    this.root.appendChild(counter);
    this.counterEl = counter;
  }

  private counterEl!: HTMLElement;

  private togglePlay(button: HTMLButtonElement): void {
    if (this.playing) {
      this.stopPlay();
      button.textContent = "自動再生 ▶▶";
      return;
    }
    this.playing = true;
    button.textContent = "■ 停止";
    this.timer = setInterval(() => {
      if (this.index >= this.total - 1) {
        this.stopPlay();
        button.textContent = "自動再生 ▶▶";
        return;
      }
      this.goTo(this.index + 1);
    }, 500);
  }

  private stopPlay(): void {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  goTo(index: number): void {
    this.index = Math.max(0, Math.min(this.total - 1, index));
    this.emit();
  }

  getIndex(): number {
    return this.index;
  }

  private emit(): void {
    this.counterEl && (this.counterEl.textContent = `ステップ ${this.index + 1} / ${this.total}`);
    this.callbacks.onStepChange(this.index, this.total);
  }
}
