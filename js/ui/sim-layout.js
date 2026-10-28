/** 画面（講義回）の冒頭に置く見出し。対応する講義資料のファイル名とノートのページ番号を示す。 */
export function createPageHeader(container, spec) {
    const header = document.createElement("header");
    header.className = "page-header";
    header.innerHTML = `
    <h2 class="page-title">${spec.title}</h2>
    <p class="page-source">講義資料: ${spec.pdfFile}　（ノート ${spec.pageRange}）</p>
  `;
    container.appendChild(header);
}
export function createSimLayout(container, spec) {
    container.innerHTML = "";
    const article = document.createElement("article");
    article.className = "sim";
    const header = document.createElement("header");
    header.className = "sim-header";
    header.innerHTML = `
    <h2 class="sim-title">${spec.title}</h2>
    <p class="sim-page">対応ノート: ${spec.lecture}　${spec.page}</p>
    <p class="sim-purpose">${spec.purpose}</p>
  `;
    article.appendChild(header);
    if (spec.theorems && spec.theorems.length > 0) {
        const theoremBox = document.createElement("div");
        theoremBox.className = "sim-theorems";
        theoremBox.innerHTML =
            "<h3>関連する定理</h3><ul>" +
                spec.theorems.map((t) => `<li><strong>${t.id}</strong>（${t.page}）: ${t.text}</li>`).join("") +
                "</ul>";
        article.appendChild(theoremBox);
    }
    const body = document.createElement("div");
    body.className = "sim-body";
    const operationSection = document.createElement("section");
    operationSection.className = "sim-operation";
    operationSection.setAttribute("aria-label", "操作");
    operationSection.innerHTML = "<h3>操作</h3>";
    const operation = document.createElement("div");
    operation.className = "sim-operation-content";
    operationSection.appendChild(operation);
    const displaySection = document.createElement("section");
    displaySection.className = "sim-display";
    displaySection.setAttribute("aria-label", "表示");
    displaySection.innerHTML = "<h3>表示</h3>";
    const display = document.createElement("div");
    display.className = "sim-display-content";
    displaySection.appendChild(display);
    body.appendChild(operationSection);
    body.appendChild(displaySection);
    article.appendChild(body);
    const quizSection = document.createElement("section");
    quizSection.className = "sim-quiz";
    quizSection.setAttribute("aria-label", "確認問題");
    quizSection.innerHTML = "<h3>確認問題</h3>";
    const quiz = document.createElement("div");
    quiz.className = "sim-quiz-content";
    quizSection.appendChild(quiz);
    article.appendChild(quizSection);
    const glossarySection = document.createElement("section");
    glossarySection.className = "sim-glossary";
    glossarySection.setAttribute("aria-label", "用語の確認");
    glossarySection.innerHTML = "<h3>用語の確認</h3>";
    const glossary = document.createElement("div");
    glossary.className = "sim-glossary-content";
    glossarySection.appendChild(glossary);
    article.appendChild(glossarySection);
    container.appendChild(article);
    return { operation, display, quiz, glossary };
}
export function renderGlossary(container, terms) {
    container.innerHTML = "";
    const dl = document.createElement("dl");
    dl.className = "glossary-list";
    for (const t of terms) {
        const dt = document.createElement("dt");
        dt.textContent = t.term;
        const dd = document.createElement("dd");
        dd.textContent = t.def;
        dl.appendChild(dt);
        dl.appendChild(dd);
    }
    container.appendChild(dl);
}
export function renderQuiz(container, questions) {
    container.innerHTML = "";
    questions.forEach((q, qi) => {
        const fieldset = document.createElement("fieldset");
        fieldset.className = "quiz-item";
        const legend = document.createElement("legend");
        legend.textContent = `問${qi + 1}. ${q.prompt}`;
        fieldset.appendChild(legend);
        const feedback = document.createElement("p");
        feedback.className = "quiz-feedback";
        feedback.setAttribute("aria-live", "polite");
        const choiceWrap = document.createElement("div");
        choiceWrap.className = "quiz-choices";
        q.choices.forEach((choiceText, ci) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "quiz-choice";
            btn.textContent = choiceText;
            btn.addEventListener("click", () => {
                choiceWrap.querySelectorAll(".quiz-choice").forEach((el) => el.classList.remove("quiz-choice-correct", "quiz-choice-wrong"));
                if (ci === q.correctIndex) {
                    btn.classList.add("quiz-choice-correct");
                    feedback.textContent = `正解です。${q.explanation ?? ""}`;
                    feedback.classList.remove("quiz-feedback-wrong");
                    feedback.classList.add("quiz-feedback-correct");
                }
                else {
                    btn.classList.add("quiz-choice-wrong");
                    feedback.textContent = `不正解です。もう一度考えてみましょう。${q.explanation ? "（ヒント: " + q.explanation + "）" : ""}`;
                    feedback.classList.remove("quiz-feedback-correct");
                    feedback.classList.add("quiz-feedback-wrong");
                }
            });
            choiceWrap.appendChild(btn);
        });
        fieldset.appendChild(choiceWrap);
        fieldset.appendChild(feedback);
        container.appendChild(fieldset);
    });
}
//# sourceMappingURL=sim-layout.js.map