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

  const rolloutScenes = {
    a01: {
      code: "A-01 · stochastic toss",
      title: "Coin flip",
      action: "Flick the coin once.",
      clips: [
        { model: "HappyHorse", asset: "a01-happyhorse-r000", outcome: "PAWEval · heads", status: "Readable" },
        { model: "Veo3.1 Fast", asset: "a01-veo31-r000", outcome: "PAWEval · not readable", status: "Outcome hidden", unreadable: true },
        { model: "Kling 3 Std.", asset: "a01-kling3-r000", outcome: "PAWEval · heads", status: "Readable" },
        { model: "Wan2.2", asset: "a01-wan22-r000", outcome: "PAWEval · heads", status: "Readable" }
      ]
    },
    a09: {
      code: "A-09 · two-outcome fall",
      title: "Vertical pencil fall",
      action: "Move the hand upward once and let the pencil fall.",
      clips: [
        { model: "HappyHorse", asset: "a09-happyhorse-r000", outcome: "PAWEval · falls right", status: "Readable" },
        { model: "Veo3.1 Fast", asset: "a09-veo31-r000", outcome: "PAWEval · falls right", status: "Readable" },
        { model: "Kling 3 Std.", asset: "a09-kling3-r000", outcome: "PAWEval · falls left", status: "Readable" },
        { model: "Wan2.2", asset: "a09-wan22-r000", outcome: "PAWEval · falls right", status: "Readable" }
      ]
    },
    bc01: {
      code: "BC-01 · collision and containment",
      title: "Ball toss into cup",
      action: "Toss the ball once from the visible hand pose toward the cup.",
      clips: [
        { model: "HappyHorse", asset: "bc01-happyhorse-r000", outcome: "PAWEval · clean in cup", status: "Readable" },
        { model: "Veo3.1 Fast", asset: "bc01-veo31-r000", outcome: "PAWEval · clean in cup", status: "Readable" },
        { model: "Kling 3 Std.", asset: "bc01-kling3-r000", outcome: "PAWEval · clean in cup", status: "Readable" },
        { model: "Wan2.2", asset: "bc01-wan22-r000", outcome: "PAWEval · clean in cup", status: "Readable" }
      ]
    }
  };

  const rolloutPanel = document.getElementById("rollout-panel");
  const rolloutCode = document.getElementById("rollout-scene-code");
  const rolloutTitle = document.getElementById("rollout-scene-title");
  const rolloutAction = document.getElementById("rollout-scene-action");
  const rolloutCards = Array.from(document.querySelectorAll("[data-rollout-card]"));
  const rolloutPlayButton = document.querySelector("[data-rollout-play]");
  const rolloutRestartButton = document.querySelector("[data-rollout-restart]");

  function rolloutVideos() {
    return rolloutCards.map((card) => card.querySelector("[data-rollout-video]")).filter(Boolean);
  }

  function setRolloutPlaying(isPlaying) {
    if (!rolloutPlayButton) return;
    rolloutPlayButton.dataset.playing = String(isPlaying);
    rolloutPlayButton.textContent = isPlaying ? "Pause all" : "Play all";
  }

  function pauseRollouts() {
    rolloutVideos().forEach((video) => video.pause());
    setRolloutPlaying(false);
  }

  function renderRolloutScene(sceneKey) {
    const scene = rolloutScenes[sceneKey];
    if (!scene) return;

    pauseRollouts();
    if (rolloutCode) rolloutCode.textContent = scene.code;
    if (rolloutTitle) rolloutTitle.textContent = scene.title;
    if (rolloutAction) rolloutAction.textContent = scene.action;

    rolloutCards.forEach((card, index) => {
      const clip = scene.clips[index];
      const model = card.querySelector("[data-rollout-model]");
      const video = card.querySelector("[data-rollout-video]");
      const source = video?.querySelector("source");
      const outcome = card.querySelector("[data-rollout-outcome]");
      const status = card.querySelector("[data-rollout-status]");
      if (!clip || !video || !source) return;

      if (model) model.textContent = clip.model;
      video.poster = `static/video/rollouts/${clip.asset}.jpg`;
      video.setAttribute("aria-label", `${clip.model} rollout for ${scene.title}`);
      source.src = `static/video/rollouts/${clip.asset}.mp4`;
      video.load();
      if (outcome) {
        outcome.textContent = clip.outcome;
        outcome.classList.toggle("unreadable", Boolean(clip.unreadable));
      }
      if (status) status.textContent = clip.status;
    });

    const activeTab = document.querySelector(`[data-rollout-scene="${sceneKey}"]`);
    if (rolloutPanel && activeTab) rolloutPanel.setAttribute("aria-labelledby", activeTab.id);
  }

  wireTabs(".rollout-tab", null, "rolloutScene", renderRolloutScene);

  if (rolloutPlayButton) {
    rolloutPlayButton.addEventListener("click", async () => {
      const videos = rolloutVideos();
      const shouldPause = rolloutPlayButton.dataset.playing === "true";
      if (shouldPause) {
        pauseRollouts();
        return;
      }

      videos.forEach((video) => {
        video.muted = true;
        if (video.ended) video.currentTime = 0;
      });
      await Promise.allSettled(videos.map((video) => video.play()));
      setRolloutPlaying(videos.some((video) => !video.paused));
    });
  }

  if (rolloutRestartButton) {
    rolloutRestartButton.addEventListener("click", () => {
      const wasPlaying = rolloutPlayButton?.dataset.playing === "true";
      rolloutVideos().forEach((video) => {
        video.currentTime = 0;
        if (wasPlaying) void video.play();
      });
    });
  }

  rolloutVideos().forEach((video) => {
    video.addEventListener("ended", () => {
      if (rolloutVideos().every((item) => item.ended || item.paused)) setRolloutPlaying(false);
    });
  });

  const dialog = document.querySelector(".image-dialog");
  const dialogImage = dialog ? dialog.querySelector("img") : null;
  const dialogCaption = dialog ? dialog.querySelector("#dialog-caption") : null;
  const closeButton = dialog ? dialog.querySelector(".dialog-close") : null;

  document.querySelectorAll("[data-zoom-src]").forEach((button) => {
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
