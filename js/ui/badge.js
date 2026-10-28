export function renderBadge(container, spec) {
    container.innerHTML = "";
    const badge = document.createElement("div");
    badge.className = `badge badge-${spec.verdict}`;
    badge.setAttribute("role", "status");
    const mark = document.createElement("span");
    mark.className = "badge-mark";
    mark.textContent = spec.verdict === "yes" ? "○" : spec.verdict === "no" ? "×" : "ー";
    mark.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "badge-title";
    title.textContent = spec.title;
    badge.appendChild(mark);
    badge.appendChild(title);
    container.appendChild(badge);
    if (spec.reason) {
        const reason = document.createElement("p");
        reason.className = "badge-reason";
        reason.textContent = spec.reason;
        container.appendChild(reason);
    }
}
export function renderConditionList(container, conditions) {
    container.innerHTML = "";
    const ul = document.createElement("ul");
    ul.className = "condition-list";
    for (const c of conditions) {
        const li = document.createElement("li");
        li.className = c.ok ? "condition-ok" : "condition-ng";
        const mark = document.createElement("span");
        mark.className = "condition-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = c.ok ? "✓" : "✗";
        const text = document.createElement("span");
        text.textContent = `${c.label}${c.ok ? "（成立）" : "（不成立）"}`;
        li.appendChild(mark);
        li.appendChild(text);
        if (c.detail) {
            const detail = document.createElement("p");
            detail.className = "condition-detail";
            detail.textContent = c.detail;
            li.appendChild(detail);
        }
        ul.appendChild(li);
    }
    container.appendChild(ul);
}
//# sourceMappingURL=badge.js.map