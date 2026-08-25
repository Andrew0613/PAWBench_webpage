(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navBar = document.getElementById("nav-bar");
  const header = document.getElementById("header-container");
  const navLinks = Array.from(document.querySelectorAll(".nav-bar .nav-link"));
  let copyResetTimer = null;

  function updateNav() {
    if (!navBar || !header) return;

    const headerBottom = header.getBoundingClientRect().bottom;
    const isMobile = window.innerWidth < 768;
    navBar.style.display = headerBottom > 0 || isMobile ? "none" : "block";

    const currentLink = navLinks
      .map((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (!section) return null;
        const rect = section.getBoundingClientRect();
        const targetLine = window.innerHeight * 0.32;
        const isCandidate = rect.top <= targetLine && rect.bottom >= targetLine;
        return isCandidate ? { link, distance: Math.abs(rect.top - targetLine) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)[0]?.link;

    navLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (!section) return;

      if (link === currentLink) {
        link.classList.add("active-link");
        link.setAttribute("aria-current", "location");
      } else {
        link.classList.remove("active-link");
        link.removeAttribute("aria-current");
      }
    });
  }

  document.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);
  updateNav();

  document.querySelectorAll("a[href^='#']:not(.skip-link)").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", link.getAttribute("href"));
    });
  });

  document.querySelectorAll(".skip-link").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target instanceof HTMLElement) {
        window.setTimeout(() => target.focus({ preventScroll: true }), 0);
      }
    });
  });

  function activateTab(tabs, panels, activeTab, tabKeyName, panelKeyName) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset[panelKeyName] !== activeTab.dataset[tabKeyName];
    });
  }

  function wireTabs(tabSelector, panelSelector, tabKeyName, onActivate, panelKeyName = tabKeyName) {
    const tabs = Array.from(document.querySelectorAll(tabSelector));
    const panels = panelSelector ? Array.from(document.querySelectorAll(panelSelector)) : [];
    if (tabs.length === 0) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(tabs, panels, tab, tabKeyName, panelKeyName);
        if (onActivate) onActivate(tab.dataset[tabKeyName]);
      });

      tab.addEventListener("keydown", (event) => {
        const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const next = tabs[(index + direction + tabs.length) % tabs.length];
        next.focus();
        activateTab(tabs, panels, next, tabKeyName, panelKeyName);
        if (onActivate) onActivate(next.dataset[tabKeyName]);
      });
    });
  }

  wireTabs(".scenario-tab", ".scenario-panel", "scenarioTab", null, "scenarioPanel");

  const evidenceCases = {
    concept: [
      {
        kind: "Paper evidence",
        title: "One plausible future",
        caption: "A single rollout is one sample from a distribution; it cannot establish support or probability-mass alignment.",
        src: "static/img/one_plausible_future.png",
        width: "2653",
        height: "975",
        alt: "Paper evidence figure: one plausible future is one sample from a wider outcome distribution."
      }
    ],
    evaluation: [
      {
        kind: "Paper evidence",
        title: "PAWEval overview",
        caption: "Readable, in-schema outcome labels are aggregated into conditional distributions; model-scene pairs are scoreable only after the gate.",
        src: "static/img/paweval_overview.png",
        width: "1229",
        height: "360",
        alt: "Paper evidence figure: PAWEval maps repeated rollouts to terminal outcome distributions."
      },
      {
        kind: "Controlled diagnostic",
        title: "Causal and non-causal controls",
        caption: "Models underreact to physically causal interventions and overreact to non-causal cues; bars are conditional on valid readouts.",
        src: "static/img/causal_noncausal_interventions.png",
        width: "2115",
        height: "639",
        alt: "Controlled diagnostic with paired causal and non-causal interventions."
      },
      {
        kind: "Evaluation robustness",
        title: "Rollout-budget sensitivity",
        caption: "Larger rollout budgets increase coverage for some models but leave calibration largely unchanged.",
        src: "static/img/rollout_budget_diagnostics.png",
        width: "2964",
        height: "1012",
        alt: "Conditional TVD and coverage as rollout budget increases from one to one hundred."
      }
    ],
    alignment: [
      {
        kind: "Paper evidence",
        title: "Explicit target realization",
        caption: "Target prompts measure whether generators realize requested outcomes; failures count as misses in the 2,500 planned rows per model.",
        src: "static/img/explicit_target_realization.png",
        width: "753",
        height: "443",
        alt: "Paper evidence figure showing explicit target realization rates across video generators."
      },
      {
        kind: "Paper evidence",
        title: "Training mass response",
        caption: "Training-mixture plots are conditional on readable left/right outcomes, with invalid readouts excluded.",
        src: "static/img/training_mass_response.png",
        width: "837",
        height: "444",
        alt: "Paper evidence figure showing generated left-fall frequency as training left-fall share increases."
      }
    ]
  };

  let evidenceCategory = "concept";
  let evidenceIndex = 0;
  const evidenceKind = document.getElementById("evidence-kind");
  const evidenceTitle = document.getElementById("evidence-title");
  const evidenceCaption = document.getElementById("evidence-caption");
  const evidenceImage = document.getElementById("evidence-image");
  const evidenceFigure = document.querySelector("[data-evidence-zoom]");
  const evidencePanel = document.getElementById("evidence-panel");
  const evidenceNavButtons = Array.from(document.querySelectorAll("[data-evidence-nav]"));

  function renderEvidence() {
    const cases = evidenceCases[evidenceCategory] || [];
    const current = cases[evidenceIndex] || cases[0];
    if (!current || !evidenceImage || !evidenceFigure) return;

    evidenceKind.textContent = current.kind;
    evidenceTitle.textContent = current.title;
    evidenceCaption.textContent = current.caption;
    evidenceImage.src = current.src;
    evidenceImage.width = current.width;
    evidenceImage.height = current.height;
    evidenceImage.alt = current.alt;
    evidenceFigure.dataset.zoomSrc = current.src;
    evidenceFigure.dataset.zoomCaption = `${current.title}: ${current.caption}`;

    const hasMultipleCases = cases.length > 1;
    evidenceNavButtons.forEach((button) => {
      button.disabled = !hasMultipleCases;
      button.setAttribute("aria-disabled", String(!hasMultipleCases));
    });
  }

  function setEvidenceCategory(category) {
    evidenceCategory = category;
    evidenceIndex = 0;
    const tab = document.querySelector(`[data-evidence-category="${category}"]`);
    if (tab && evidencePanel) {
      evidencePanel.setAttribute("aria-labelledby", tab.id);
    }
    renderEvidence();
  }

  wireTabs(".evidence-tab", null, "evidenceCategory", setEvidenceCategory);

  evidenceNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const cases = evidenceCases[evidenceCategory] || [];
      if (cases.length === 0) return;
      const direction = button.dataset.evidenceNav === "next" ? 1 : -1;
      evidenceIndex = (evidenceIndex + direction + cases.length) % cases.length;
      renderEvidence();
    });
  });
  renderEvidence();

  const dialog = document.querySelector(".image-dialog");
  const dialogImage = dialog ? dialog.querySelector("img") : null;
  const dialogCaption = dialog ? dialog.querySelector("#dialog-caption") : null;
  const closeButton = dialog ? dialog.querySelector(".dialog-close") : null;

  document.querySelectorAll("[data-zoom-src], [data-evidence-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!dialog || !dialogImage || !dialogCaption || typeof dialog.showModal !== "function") return;
      dialogImage.src = button.dataset.zoomSrc;
      dialogImage.alt = button.querySelector("img")?.alt || "Enlarged research figure";
      dialogCaption.textContent = button.dataset.zoomCaption || "";
      dialog.showModal();
      closeButton?.focus();
    });
  });

  if (dialog && closeButton) {
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  const copyButton = document.querySelector("[data-copy-bibtex]");
  const bibtex = document.querySelector("#bibtex code");

  if (copyButton && bibtex) {
    const originalLabel = copyButton.textContent;
    copyButton.addEventListener("click", async () => {
      if (copyResetTimer) {
        window.clearTimeout(copyResetTimer);
      }

      try {
        await navigator.clipboard.writeText(bibtex.textContent.trim());
        copyButton.textContent = "Copied";
      } catch (_error) {
        copyButton.textContent = "Select text";
      }

      copyResetTimer = window.setTimeout(() => {
        copyButton.textContent = originalLabel;
        copyResetTimer = null;
      }, 1800);
    });
  }
})();
