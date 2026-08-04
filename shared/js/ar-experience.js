import { PLAYER, STORAGE_KEY, TIMING } from "./config.js";

/**
 * Shared interactive AR experience for mocks (1) and (2).
 * mode: "proposal" | "ar-only"
 */
export function initExperience(options = {}) {
  const mode = options.mode || "proposal";
  const root = document.documentElement;
  root.style.setProperty("--scan-ms", `${TIMING.scanMs}ms`);
  root.style.setProperty("--glow-ms", `${TIMING.glowMs}ms`);
  root.style.setProperty("--fade-ms", `${TIMING.fadeMs}ms`);

  const els = {
    screens: {
      title: document.getElementById("screen-title"),
      map: document.getElementById("screen-map"),
      notice: document.getElementById("screen-notice"),
      unsupported: document.getElementById("screen-unsupported"),
    },
    arRoot: document.getElementById("ar-root"),
    viewer: document.getElementById("player-viewer"),
    arButton: document.getElementById("ar-button"),
    overlay: document.getElementById("ar-overlay"),
    playerPin: document.getElementById("player-pin"),
    mapCleared: document.getElementById("map-cleared"),
    mapHint: document.getElementById("map-hint"),
    footprint: document.getElementById("footprint"),
    groundRing: document.getElementById("ground-ring"),
    scanFrame: document.getElementById("scan-frame"),
    scanLine: document.getElementById("scan-line"),
    glowFlash: document.getElementById("glow-flash"),
    cardStage: document.getElementById("card-stage"),
    playerCard: document.getElementById("player-card"),
    cardMsg: document.getElementById("card-msg"),
    tapCatcher: document.getElementById("tap-catcher"),
    fadeBlack: document.getElementById("fade-black"),
    playerHud: document.getElementById("player-hud"),
    scanHud: document.getElementById("scan-hud"),
    farewellHud: document.getElementById("farewell-hud"),
    scanHint: document.getElementById("scan-hint"),
    btnRunScan: document.getElementById("btn-run-scan"),
    btnCancelScan: document.getElementById("btn-cancel-scan"),
    nameEls: document.querySelectorAll("[data-player-name]"),
    introEls: document.querySelectorAll("[data-intro-line]"),
    farewellEls: document.querySelectorAll("[data-farewell-line]"),
  };

  let state = "boot";
  let scanTimer = null;
  let glowTimer = null;
  let acquireStep = 0;
  let closingAr = false;

  fillCopy();
  bindUi();
  updateMapPin();
  setArUi("none");

  if (mode === "ar-only") {
    showScreen("notice");
  } else {
    showScreen("title");
  }

  function fillCopy() {
    els.nameEls.forEach((el) => {
      el.textContent = PLAYER.nameRomaji;
    });
    els.introEls.forEach((el) => {
      el.textContent = PLAYER.introLine;
    });
    els.farewellEls.forEach((el) => {
      el.textContent = PLAYER.farewellLine;
    });
    if (els.playerCard) {
      els.playerCard.style.backgroundImage = `url("${PLAYER.cardImage}")`;
    }
    if (els.viewer) {
      els.viewer.src = PLAYER.modelSrc;
      els.viewer.poster = PLAYER.posterSrc;
    }
  }

  function bindUi() {
    // WebXR: without preventDefault, taps become XR selects and DOM buttons fail.
    const blockXrSelect = (event) => {
      if (state === "floor") return; // allow placement taps to pass through
      event.preventDefault();
    };
    els.overlay?.addEventListener("beforexrselect", blockXrSelect);
    els.viewer?.addEventListener("beforexrselect", (event) => {
      // If the tap target is inside our overlay UI, always block XR select.
      const path = event.composedPath?.() || [];
      const inOverlay = path.includes(els.overlay);
      if (inOverlay && state !== "floor") {
        event.preventDefault();
      }
    });

    document.getElementById("btn-start")?.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("map");
    });

    document.getElementById("btn-reset-collection")?.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem(STORAGE_KEY);
      updateMapPin();
    });

    els.playerPin?.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("notice");
    });

    document.getElementById("btn-start-ar")?.addEventListener("click", (e) => {
      e.preventDefault();
      startArFlow();
    });

    document.getElementById("btn-back-map")?.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("map");
    });

    document.getElementById("btn-scan")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      enterScanMode();
    });

    els.btnCancelScan?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cancelScanMode();
    });

    els.btnRunScan?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      runScan();
    });

    document.getElementById("btn-farewell-ok")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      finishAndReturn();
    });

    els.tapCatcher?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      advanceAcquire();
    });

    els.viewer?.addEventListener("ar-status", onArStatus);
  }

  function showScreen(name) {
    state = name;
    Object.entries(els.screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("is-active", key === name);
    });
    if (name !== "unsupported") {
      els.arRoot?.classList.remove("is-active");
    }
    if (name === "map") updateMapPin();
  }

  function isCollected() {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  }

  function updateMapPin() {
    const collected = isCollected();
    if (els.playerPin) els.playerPin.hidden = collected;
    if (els.mapCleared) els.mapCleared.hidden = !collected;
    if (els.mapHint) {
      els.mapHint.textContent = collected
        ? "選手を獲得済みです。やり直すか、TOPへ戻ってください。"
        : "選手ピンをタップするとARへ進みます。獲得済みの選手はMAPから消えます。";
    }
  }

  async function startArFlow() {
    const supported = await canUseWebXr();
    if (!supported) {
      showScreen("unsupported");
      return;
    }

    Object.values(els.screens).forEach((el) => el?.classList.remove("is-active"));
    if (els.arRoot) {
      els.arRoot.style.pointerEvents = "";
      els.arRoot.style.visibility = "";
      els.arRoot.classList.add("is-active");
    }
    setArUi("floor");
    state = "floor";
    closingAr = false;

    requestAnimationFrame(async () => {
      try {
        if (typeof els.viewer?.activateAR === "function") {
          await els.viewer.activateAR();
        } else {
          els.arButton?.click();
        }
      } catch (err) {
        console.warn(err);
        exitArTo("unsupported");
      }
    });
  }

  async function canUseWebXr() {
    if (!window.isSecureContext) return false;
    if (!navigator.xr?.isSessionSupported) return false;
    try {
      return await navigator.xr.isSessionSupported("immersive-ar");
    } catch {
      return false;
    }
  }

  function onArStatus(event) {
    const status = event.target.getAttribute("ar-status") || event.detail?.status;
    if (closingAr) return;
    if (status === "failed") {
      exitArTo("unsupported");
      return;
    }
    if (status === "session-started" && state === "floor") {
      setArUi("floor");
      return;
    }
    if (status === "object-placed" && state === "floor") {
      setArUi("player");
      state = "player";
      return;
    }
    if (status === "not-presenting" && (state === "floor" || isArGameplayState())) {
      if (mode === "proposal") {
        exitArTo("map");
      } else {
        exitArTo("notice");
      }
    }
  }

  function isArGameplayState() {
    return ["player", "scan", "scanning", "acquire", "farewell"].includes(state);
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.hidden = hidden;
    el.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function setArUi(phase) {
    const floor = phase === "floor";
    const player = phase === "player";
    const scan = phase === "scan" || phase === "scanning";
    const acquire = phase === "acquire";
    const farewell = phase === "farewell";

    setHidden(els.footprint, !floor);
    els.groundRing?.classList.toggle("is-on", player || scan || farewell);
    els.scanFrame?.classList.toggle("is-on", scan);
    setHidden(els.scanFrame, !scan);

    setHidden(els.playerHud, !player);
    setHidden(els.scanHud, !scan);
    setHidden(els.farewellHud, !farewell);
    setHidden(els.cardStage, !acquire);
    els.cardStage?.classList.toggle("is-on", acquire);

    if (els.btnRunScan) {
      els.btnRunScan.disabled = phase === "scanning";
    }

    if (!scan) {
      els.scanLine?.classList.remove("is-running");
    }
    if (!acquire) {
      acquireStep = 0;
    }

    // Keep overlay interactive after placement
    els.overlay?.classList.toggle("is-blocking", phase !== "floor" && phase !== "none");
  }

  function enterScanMode() {
    if (state !== "player" && state !== "scan") return;
    clearScanTimers();
    state = "scan";
    setArUi("scan");
    if (els.scanHint) els.scanHint.textContent = "選手をスキャンしよう！";
  }

  function cancelScanMode() {
    if (state !== "scan" && state !== "scanning") return;
    clearScanTimers();
    els.glowFlash?.classList.remove("is-on");
    state = "player";
    setArUi("player");
  }

  function runScan() {
    if (state !== "scan") return;
    state = "scanning";
    setArUi("scanning");
    if (els.scanHint) els.scanHint.textContent = "スキャン中";

    els.scanLine?.classList.remove("is-running");
    void els.scanLine?.offsetWidth;
    els.scanLine?.classList.add("is-running");

    clearScanTimers();
    scanTimer = setTimeout(() => {
      els.glowFlash?.classList.remove("is-on");
      void els.glowFlash?.offsetWidth;
      els.glowFlash?.classList.add("is-on");

      glowTimer = setTimeout(() => {
        els.glowFlash?.classList.remove("is-on");
        enterAcquire();
      }, TIMING.glowMs);
    }, TIMING.scanMs);
  }

  function enterAcquire() {
    clearScanTimers();
    state = "acquire";
    acquireStep = 0;
    setArUi("acquire");
    if (els.cardMsg) els.cardMsg.textContent = PLAYER.acquiredLine;
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  function advanceAcquire() {
    if (state !== "acquire") return;
    if (acquireStep === 0) {
      acquireStep = 1;
      if (els.cardMsg) els.cardMsg.textContent = PLAYER.registeredLine;
      return;
    }
    enterFarewell();
  }

  function enterFarewell() {
    state = "farewell";
    setArUi("farewell");
  }

  async function finishAndReturn() {
    if (state !== "farewell" || closingAr) return;
    closingAr = true;
    clearScanTimers();
    els.fadeBlack?.classList.add("is-on");
    await wait(TIMING.fadeMs);

    // Always leave AR UI first so MAP is usable even if exitAR hangs.
    forceLeaveAr();
    if (mode === "proposal") {
      showScreen("map");
    } else {
      showScreen("notice");
    }

    try {
      if (els.viewer?.exitAR) {
        await Promise.race([
          els.viewer.exitAR(),
          wait(1500),
        ]);
      }
    } catch {
      // ignore
    }

    closingAr = false;
  }

  function forceLeaveAr() {
    clearScanTimers();
    els.fadeBlack?.classList.remove("is-on");
    els.glowFlash?.classList.remove("is-on");
    els.arRoot?.classList.remove("is-active");
    setArUi("none");
    // Belt-and-suspenders against leftover XR overlay hit targets
    if (els.arRoot) {
      els.arRoot.style.pointerEvents = "none";
      els.arRoot.style.visibility = "hidden";
    }
    if (els.overlay) {
      els.overlay.classList.remove("is-blocking");
    }
  }

  function exitArTo(screenName) {
    closingAr = true;
    forceLeaveAr();
    showScreen(screenName);
    closingAr = false;
    try {
      els.viewer?.exitAR?.();
    } catch {
      // ignore
    }
  }

  function clearScanTimers() {
    clearTimeout(scanTimer);
    clearTimeout(glowTimer);
    scanTimer = null;
    glowTimer = null;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
