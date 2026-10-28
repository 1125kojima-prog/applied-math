/**
 * 目次（S01〜S12）の切り替えナビゲーション。
 * 1画面に1つのシミュレーションだけを表示し、キーボード（Tab/Enter）で選べるようにする。
 */
import { renderAllMath } from "./katex-loader.js";
export class Nav {
    constructor(listEl, contentEl, entries) {
        this.currentId = null;
        this.entries = entries;
        this.listEl = listEl;
        this.contentEl = contentEl;
        this.buildList();
    }
    buildList() {
        this.listEl.innerHTML = "";
        this.listEl.setAttribute("role", "list");
        for (const entry of this.entries) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "nav-item";
            button.id = `navbtn-${entry.id}`;
            button.innerHTML = `<span class="nav-item-title">${entry.title}</span><span class="nav-item-page">${entry.lecture} ${entry.page}</span>`;
            button.addEventListener("click", () => this.show(entry.id));
            item.appendChild(button);
            this.listEl.appendChild(item);
        }
    }
    show(id) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry)
            return;
        this.currentId = id;
        this.listEl.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("nav-item-active"));
        document.getElementById(`navbtn-${id}`)?.classList.add("nav-item-active");
        this.contentEl.innerHTML = "";
        this.contentEl.focus();
        entry.mount(this.contentEl);
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
        const target = this.entries.find((e) => e.id === hash);
        this.show(target ? target.id : this.entries[0].id);
    }
}
//# sourceMappingURL=nav.js.map