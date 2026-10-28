/**
 * 各シミュレーションの共通テンプレート（指示書 §5）。
 * タイトル／対応ページ／目的／操作／表示／確認問題／用語の確認、の順に組み立てる。
 */
export interface SimLayoutSpec {
    title: string;
    page: string;
    lecture: string;
    purpose: string;
    theorems?: Array<{
        id: string;
        text: string;
        page: string;
    }>;
}
export interface SimLayoutRefs {
    operation: HTMLElement;
    display: HTMLElement;
    quiz: HTMLElement;
    glossary: HTMLElement;
}
export interface PageHeaderSpec {
    title: string;
    pdfFile: string;
    pageRange: string;
}
/** 画面（講義回）の冒頭に置く見出し。対応する講義資料のファイル名とノートのページ番号を示す。 */
export declare function createPageHeader(container: HTMLElement, spec: PageHeaderSpec): void;
export declare function createSimLayout(container: HTMLElement, spec: SimLayoutSpec): SimLayoutRefs;
export declare function renderGlossary(container: HTMLElement, terms: Array<{
    term: string;
    def: string;
}>): void;
export interface QuizQuestion {
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string;
}
export declare function renderQuiz(container: HTMLElement, questions: QuizQuestion[]): void;
