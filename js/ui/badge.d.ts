/**
 * 判定結果を大きな帯（バッジ）で表示する共通コンポーネント（指示書 §4.1, §4.6）。
 * 色だけで判断させないよう、必ず文字（○/×や語句）も表示する。
 */
export type Verdict = "yes" | "no" | "neutral";
export interface BadgeSpec {
    verdict: Verdict;
    title: string;
    reason?: string;
}
export declare function renderBadge(container: HTMLElement, spec: BadgeSpec): void;
export declare function renderConditionList(container: HTMLElement, conditions: Array<{
    label: string;
    ok: boolean;
    detail?: string;
}>): void;
