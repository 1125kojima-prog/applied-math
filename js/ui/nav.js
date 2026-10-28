/**
 * 目次（第1回〜第7回）の切り替えナビゲーション。
 * 1画面に1つの講義回（ページ）だけを表示する。各ページの冒頭には対応する
 * 講義資料のファイル名とノートのページ番号を示し、その回に対応するシミュレー
 * ションだけを並べる。キーボード（Tab/Enter）でも選べるようにする。
 */
import { renderAllMath } from "./katex-loader.js";
import { createPageHeader } from "./sim-layout.js";
export class Nav {
    constructor(listEl, contentEl, pages) {
        this.currentId = null;
        this.pages = pages;
        this.listEl = listEl;
        this.contentEl = contentEl;
        this.buildList();
    }
    buildList() {
        this.listEl.innerHTML = "";
        this.listEl.setAttribute("role", "list");
        for (const page of this.pages) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "nav-item";
            button.id = `navbtn-${page.id}`;
            button.innerHTML = `<span class="nav-item-title">${page.title}</span><span class="nav-item-page">${page.pdfFile}　${page.pageRange}</span>`;
            button.addEventListener("click", () => this.show(page.id));
            item.appendChild(button);
            this.listEl.appendChild(item);
        }
    }
    show(id) {
        const page = this.pages.find((p) => p.id === id);
        if (!page)
            return;
        this.currentId = id;
        this.listEl.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("nav-item-active"));
        document.getElementById(`navbtn-${id}`)?.classList.add("nav-item-active");
        this.contentEl.innerHTML = "";
        this.contentEl.focus();
        createPageHeader(this.contentEl, { title: page.title, pdfFile: page.pdfFile, pageRange: page.pageRange });
        for (const sim of page.sims) {
            const wrap = document.createElement("div");
            wrap.className = "page-sim";
            this.contentEl.appendChild(wrap);
            sim.mount(wrap);
        }
        renderAllMath(this.contentEl);
        try {
            location.hash = id;
        }
        catch {
            // hash更新に失敗しても致命的ではない
        }
    }
    getCurrentId() {
        return this.currentId;
    }
    showFromHashOrFirst() {
        const hash = location.hash.replace("#", "");
        const target = this.pages.find((p) => p.id === hash);
        this.show(target ? target.id : this.pages[0].id);
    }
}
//# sourceMappingURL=nav.js.map