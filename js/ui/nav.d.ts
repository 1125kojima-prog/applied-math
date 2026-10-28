export interface SimEntry {
    id: string;
    title: string;
    page: string;
    lecture: string;
    mount: (container: HTMLElement) => void;
}
export declare class Nav {
    private entries;
    private listEl;
    private contentEl;
    private currentId;
    constructor(listEl: HTMLElement, contentEl: HTMLElement, entries: SimEntry[]);
    private buildList;
    show(id: string): void;
    getCurrentId(): string | null;
    showFromHashOrFirst(): void;
}
