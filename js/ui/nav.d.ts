export interface SimEntry {
    id: string;
    mount: (container: HTMLElement) => void;
}
export interface PageEntry {
    id: string;
    title: string;
    pdfFile: string;
    pageRange: string;
    sims: SimEntry[];
}
export declare class Nav {
    private pages;
    private listEl;
    private contentEl;
    private currentId;
    constructor(listEl: HTMLElement, contentEl: HTMLElement, pages: PageEntry[]);
    private buildList;
    show(id: string): void;
    getCurrentId(): string | null;
    showFromHashOrFirst(): void;
}
