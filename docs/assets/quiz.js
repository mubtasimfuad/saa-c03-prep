(function () {
  "use strict";

  const ASSETS_BASE = "../assets/";
  const root = document.getElementById("quiz-root");
  if (!root) return;

  /** @type {{bankId:string, mode:string, order:number[], index:number, score:number, per:Object}|null} */
  let state = null;
  let bankData = null; // full array of question objects for the active bank
  let bankMeta = null; // manifest entry for the active bank

  function storageKey(bankId, mode) {
    return `saaquiz:${bankId}:${mode}`;
  }

  function saveState() {
    if (!state) return;
    try {
      localStorage.setItem(storageKey(state.bankId, state.mode), JSON.stringify(state));
    } catch (e) {
      /* localStorage unavailable — quiz still works, just without persistence */
    }
  }

  function loadState(bankId, mode) {
    try {
      const raw = localStorage.getItem(storageKey(bankId, mode));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearState(bankId, mode) {
    try {
      localStorage.removeItem(storageKey(bankId, mode));
    } catch (e) {}
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const BOOLEAN_ATTRS = new Set(["disabled", "checked", "selected", "readonly"]);

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (BOOLEAN_ATTRS.has(k)) {
          if (v) node.setAttribute(k, "");
        } else if (v != null) {
          node.setAttribute(k, v);
        }
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  async function init() {
    root.innerHTML = "";
    root.appendChild(el("p", { class: "quiz-loading" }, ["Loading question bank…"]));
    let manifest;
    try {
      manifest = await fetchJSON(ASSETS_BASE + "quiz-data/manifest.json");
    } catch (e) {
      root.innerHTML = "";
      root.appendChild(el("p", { class: "quiz-error" }, ["Could not load the quiz data. Please refresh the page."]));
      return;
    }
    renderStart(manifest);
  }

  function renderStart(manifest) {
    root.innerHTML = "";
    const bank = manifest.banks[0]; // MVP: single bank; UI already supports more via this list
    bankMeta = bank;

    const bankButtons = manifest.banks.map((b) =>
      el(
        "div",
        { class: "quiz-bank-card" },
        [
          el("h3", null, [b.title]),
          el("p", null, [b.description || ""]),
          el("p", { class: "quiz-bank-meta" }, [`${b.count} questions`]),
          renderModeButtons(b),
        ]
      )
    );

    root.appendChild(el("div", { class: "quiz-start" }, [el("h2", null, ["Choose what to practice"]), ...bankButtons]));
  }

  function renderModeButtons(bank) {
    const wrap = el("div", { class: "quiz-mode-buttons" }, []);
    const partsPerSet = Math.ceil(bank.count / bank.parts);
    for (let p = 1; p <= bank.parts; p++) {
      const startQ = (p - 1) * partsPerSet + 1;
      const endQ = Math.min(p * partsPerSet, bank.count);
      const mode = `part-${p}`;
      const resumeable = !!loadState(bank.id, mode);
      wrap.appendChild(
        el(
          "button",
          {
            class: "md-button quiz-mode-btn",
            onclick: () => startRun(bank, mode, false),
          },
          [`Part ${p} (Q${startQ}–${endQ})${resumeable ? " — resume" : ""}`]
        )
      );
    }
    const allResumeable = !!loadState(bank.id, "all");
    wrap.appendChild(
      el(
        "button",
        {
          class: "md-button md-button--primary quiz-mode-btn",
          onclick: () => startRun(bank, "all", false),
        },
        [`All ${bank.count} (shuffled)${allResumeable ? " — resume" : ""}`]
      )
    );
    return wrap;
  }

  async function startRun(bank, mode) {
    root.innerHTML = "";
    root.appendChild(el("p", { class: "quiz-loading" }, ["Loading…"]));
    if (!bankData || bankMeta.id !== bank.id) {
      bankData = await fetchJSON(ASSETS_BASE + "quiz-data/" + bank.file);
      bankMeta = bank;
    }

    const existing = loadState(bank.id, mode);
    if (existing) {
      state = existing;
    } else {
      let order;
      if (mode === "all") {
        order = shuffle(bankData.map((q) => q.id));
      } else {
        const partNum = parseInt(mode.replace("part-", ""), 10);
        order = bankData.filter((q) => q.part === partNum).map((q) => q.id);
      }
      state = { bankId: bank.id, mode, order, index: 0, score: 0, per: {} };
      saveState();
    }
    renderQuestion();
  }

  function questionById(id) {
    return bankData.find((q) => q.id === id);
  }

  function ensurePer(id) {
    if (!state.per[id]) {
      state.per[id] = { wrongTried: [], solved: false, firstTryCorrect: null };
    }
    return state.per[id];
  }

  function renderQuestion() {
    if (state.index >= state.order.length) {
      renderSummary();
      return;
    }
    const q = questionById(state.order[state.index]);
    const per = ensurePer(q.id);

    root.innerHTML = "";

    const header = el("div", { class: "quiz-header" }, [
      el("span", { class: "quiz-progress" }, [`Question ${state.index + 1} / ${state.order.length}`]),
      el("span", { class: "quiz-score" }, [`Score: ${state.score}`]),
      el("button", { class: "md-button quiz-exit-btn", onclick: () => { state = null; init(); } }, ["Exit"]),
    ]);
    root.appendChild(header);

    const bar = el("div", { class: "quiz-progressbar" }, [
      el("div", { class: "quiz-progressbar-fill", style: `width:${((state.index) / state.order.length) * 100}%` }, []),
    ]);
    root.appendChild(bar);

    const card = el("div", { class: "quiz-card" }, []);
    card.appendChild(el("p", { class: "quiz-qid" }, [`Question ${q.id}${q.selectionType === "multi" ? ` — select ${q.requiredCount} answers` : ""}`]));
    card.appendChild(el("p", { class: "quiz-question" }, [q.question]));

    const optList = el("div", { class: "quiz-options" }, []);
    card.appendChild(optList);

    if (q.selectionType === "multi") {
      renderMultiOptions(q, per, optList, card);
    } else {
      renderSingleOptions(q, per, optList, card);
    }

    root.appendChild(card);

    if (per.solved) {
      renderBreakdown(q, card);
      appendNextButton(card);
    }
  }

  function optionRow(opt, extraClass, explanationText) {
    const row = el("div", { class: `quiz-option ${extraClass || ""}` }, []);
    row.dataset.letter = opt.letter;
    return row;
  }

  function renderSingleOptions(q, per, optList, card) {
    q.options.forEach((opt) => {
      const tried = per.wrongTried.includes(opt.letter);
      let cls = "";
      if (per.solved) {
        cls = opt.correct ? "is-correct" : tried ? "is-wrong" : "is-neutral";
      } else if (tried) {
        cls = "is-wrong";
      }
      const btn = el(
        "button",
        {
          class: `quiz-option-btn ${cls}`,
          disabled: per.solved,
          onclick: () => handleSingleClick(q, per, opt, card),
        },
        [el("span", { class: "quiz-option-letter" }, [opt.letter]), el("span", null, [opt.text])]
      );
      const wrap = el("div", { class: "quiz-option" }, [btn]);
      if ((tried && !opt.correct) || (per.solved && !opt.correct)) {
        wrap.appendChild(el("div", { class: "quiz-explanation is-wrong-explanation" }, [q.explanations[opt.letter] || ""]));
      }
      optList.appendChild(wrap);
    });
  }

  function handleSingleClick(q, per, opt, card) {
    if (per.solved) return;
    if (per.firstTryCorrect === null) {
      per.firstTryCorrect = !!opt.correct;
    }
    if (opt.correct) {
      per.solved = true;
      if (per.firstTryCorrect) state.score += 1;
      saveState();
      renderQuestion();
    } else {
      if (!per.wrongTried.includes(opt.letter)) per.wrongTried.push(opt.letter);
      saveState();
      renderQuestion();
    }
  }

  function renderMultiOptions(q, per, optList, card) {
    if (!per.selected) per.selected = [];
    q.options.forEach((opt) => {
      const checked = per.selected.includes(opt.letter);
      let cls = "";
      if (per.solved) {
        cls = opt.correct ? "is-correct" : "is-neutral";
      } else if (per.lastCheckWrong && checked) {
        cls = opt.correct ? "is-correct" : "is-wrong";
      }
      const checkbox = el("input", {
        type: "checkbox",
        disabled: per.solved,
        checked: checked,
        onchange: (e) => handleMultiToggle(q, per, opt, e.target.checked, card),
      });
      const label = el("label", { class: `quiz-option-checkbox ${cls}` }, [checkbox, el("span", { class: "quiz-option-letter" }, [opt.letter]), el("span", null, [opt.text])]);
      const wrap = el("div", { class: "quiz-option" }, [label]);
      if (per.lastCheckWrong && checked && !opt.correct) {
        wrap.appendChild(el("div", { class: "quiz-explanation is-wrong-explanation" }, [q.explanations[opt.letter] || ""]));
      }
      if (per.solved && !opt.correct) {
        wrap.appendChild(el("div", { class: "quiz-explanation is-wrong-explanation" }, [q.explanations[opt.letter] || ""]));
      }
      optList.appendChild(wrap);
    });

    if (!per.solved) {
      const remaining = q.requiredCount - per.selected.length;
      const checkBtn = el(
        "button",
        {
          class: "md-button md-button--primary quiz-check-btn",
          disabled: per.selected.length !== q.requiredCount,
          onclick: () => handleMultiCheck(q, per, card),
        },
        [remaining > 0 ? `Select ${remaining} more to check` : "Check answer"]
      );
      card.appendChild(checkBtn);
    }
  }

  function handleMultiToggle(q, per, opt, isChecked, card) {
    if (per.solved) return;
    per.selected = per.selected || [];
    if (isChecked) {
      if (per.selected.length >= q.requiredCount) {
        // enforce max selection: ignore extra check, re-render to uncheck it visually
        saveState();
        renderQuestion();
        return;
      }
      if (!per.selected.includes(opt.letter)) per.selected.push(opt.letter);
    } else {
      per.selected = per.selected.filter((l) => l !== opt.letter);
    }
    per.lastCheckWrong = false;
    saveState();
    renderQuestion();
  }

  function handleMultiCheck(q, per, card) {
    if (per.firstTryCorrect === null) {
      const correctSet = q.options.filter((o) => o.correct).map((o) => o.letter).sort().join(",");
      const selSet = per.selected.slice().sort().join(",");
      per.firstTryCorrect = correctSet === selSet;
    }
    const correctLetters = q.options.filter((o) => o.correct).map((o) => o.letter).sort();
    const selected = per.selected.slice().sort();
    const isExactMatch = correctLetters.length === selected.length && correctLetters.every((l, i) => l === selected[i]);

    if (isExactMatch) {
      per.solved = true;
      if (per.firstTryCorrect) state.score += 1;
    } else {
      per.lastCheckWrong = true;
    }
    saveState();
    renderQuestion();
  }

  function renderBreakdown(q, card) {
    const box = el("div", { class: "quiz-breakdown" }, []);
    box.appendChild(el("p", { class: "quiz-breakdown-title" }, ["✅ Correct — here's the full picture:"]));
    if (q.summary) box.appendChild(el("p", { class: "quiz-summary" }, [q.summary]));
    q.options.forEach((opt) => {
      const label = opt.correct ? "Why this is right" : "Why this is wrong";
      box.appendChild(
        el("p", { class: `quiz-breakdown-item ${opt.correct ? "is-correct" : "is-wrong"}` }, [
          el("strong", null, [`${opt.letter}. `]),
          `${label}: `,
          q.explanations[opt.letter] || "",
        ])
      );
    });
    card.appendChild(box);
  }

  function appendNextButton(card) {
    const isLast = state.index === state.order.length - 1;
    card.appendChild(
      el(
        "button",
        {
          class: "md-button md-button--primary quiz-next-btn",
          onclick: () => {
            state.index += 1;
            saveState();
            renderQuestion();
          },
        },
        [isLast ? "See results" : "Next question →"]
      )
    );
  }

  function renderSummary() {
    root.innerHTML = "";
    const total = state.order.length;
    const missed = state.order.filter((id) => {
      const per = state.per[id];
      return !per || !per.firstTryCorrect;
    });

    const box = el("div", { class: "quiz-summary-box" }, [
      el("h2", null, ["Run complete"]),
      el("p", { class: "quiz-final-score" }, [`Score: ${state.score} / ${total} (first-try correct)`]),
    ]);

    if (missed.length) {
      box.appendChild(el("p", null, [`Questions to review (answered wrong on the first try): ${missed.length}`]));
      const list = el("div", { class: "quiz-missed-list" }, []);
      missed.forEach((id) => {
        list.appendChild(
          el(
            "button",
            {
              class: "md-button quiz-missed-btn",
              onclick: () => {
                state.index = state.order.indexOf(id);
                saveState();
                renderQuestion();
              },
            },
            [`Q${id}`]
          )
        );
      });
      box.appendChild(list);
    } else {
      box.appendChild(el("p", null, ["Perfect run — every question correct on the first try."]));
    }

    const actions = el("div", { class: "quiz-summary-actions" }, [
      el(
        "button",
        {
          class: "md-button md-button--primary",
          onclick: () => {
            clearState(state.bankId, state.mode);
            state = null;
            init();
          },
        },
        ["Restart this set"]
      ),
      el(
        "button",
        {
          class: "md-button",
          onclick: () => {
            state = null;
            init();
          },
        },
        ["Choose a different part"]
      ),
    ]);
    box.appendChild(actions);

    root.appendChild(box);
  }

  init();
})();
