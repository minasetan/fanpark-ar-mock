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
    playerPin: document.getElementById("player-pin"),
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
    nameEls: document.querySelectorAll("[data-player-name]"),
    introEls: document.querySelectorAll("[data-intro-line]"),
    farewellEls: document.querySelectorAll("[data-farewell-line]"),
  };

  let state = "boot";
  let scanTimer = null;
  let acquireStep = 0;
  let closingAr = false;

  fillCopy();
  bindUi();
  updateMapPin();

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
    document.getElementById("btn-start")?.addEventListener("click", () => {
      showScreen("map");
    });

    document.getElementById("btn-reset-collection")?.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEY);
      updateMapPin();
    });

    els.playerPin?.addEventListener("click", () => {
      showScreen("notice");
    });

    document.getElementById("btn-start-ar")?.addEventListener("click", () => {
      startArFlow();
    });

    document.getElementById("btn-back-map")?.addEventListener("click", () => {
      showScreen("map");
    });

    document.getElementById("btn-scan")?.addEventListener("click", () => {
      enterScanMode();
    });

    document.getElementById("btn-cancel-scan")?.addEventListener("click", () => {
      cancelScanMode();
    });

    document.getElementById("btn-run-scan")?.addEventListener("click", () => {
      runScan();
    });

    document.getElementById("btn-farewell-ok")?.addEventListener("click", () => {
      finishAndReturn();
    });

    els.tapCatcher?.addEventListener("click", () => {
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

  function updateMapPin() {
    if (!els.playerPin) return;
    const collected = sessionStorage.getItem(STORAGE_KEY) === "1";
    els.playerPin.hidden = collected;
  }

  async function startArFlow() {
    const supported = await canUseWebXr();
    if (!supported) {
      showScreen("unsupported");
      return;
    }

    Object.values(els.screens).forEach((el) => el?.classList.remove("is-active"));
    els.arRoot.classList.add("is-active");
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
    if (status === "object-placed" && (state === "floor" || state === "boot")) {
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

  function setArUi(phase) {
    const floor = phase === "floor";
    const player = phase === "player";
    const scan = phase === "scan" || phase === "scanning";
    const acquire = phase === "acquire";
    const farewell = phase === "farewell";

    if (els.footprint) els.footprint.hidden = !floor;
    els.groundRing?.classList.toggle("is-on", player || scan || farewell);
    els.scanFrame?.classList.toggle("is-on", scan);
    if (els.playerHud) els.playerHud.hidden = !player;
    if (els.scanHud) els.scanHud.hidden = !scan;
    if (els.farewellHud) els.farewellHud.hidden = !farewell;
    els.cardStage?.classList.toggle("is-on", acquire);
    if (!scan) els.scanLine?.classList.remove("is-running");
    if (!acquire) acquireStep = 0;
  }

  function enterScanMode() {
    state = "scan";
    setArUi("scan");
    if (els.scanHint) els.scanHint.textContent = "選手をスキャンしよう！";
  }

  function cancelScanMode() {
    state = "player";
    setArUi("player");
  }

  function runScan() {
    if (state === "scanning") return;
    state = "scanning";
    setArUi("scanning");
    if (els.scanHint) els.scanHint.textContent = "スキャン中";
    els.scanLine?.classList.remove("is-running");
    // restart animation
    void els.scanLine?.offsetWidth;
    els.scanLine?.classList.add("is-running");

    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      els.glowFlash?.classList.remove("is-on");
      void els.glowFlash?.offsetWidth;
      els.glowFlash?.classList.add("is-on");
      setTimeout(() => {
        enterAcquire();
      }, TIMING.glowMs);
    }, TIMING.scanMs);
  }

  function enterAcquire() {
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
    els.cardStage?.classList.remove("is-on");
    setArUi("farewell");
  }

  async function finishAndReturn() {
    closingAr = true;
    els.fadeBlack?.classList.add("is-on");
    await wait(TIMING.fadeMs);
    try {
      if (els.viewer?.exitAR) {
        await els.viewer.exitAR();
      }
    } catch {
      // ignore
    }
    els.fadeBlack?.classList.remove("is-on");
    els.arRoot.classList.remove("is-active");
    setArUi("none");
    if (mode === "proposal") {
      showScreen("map");
    } else {
      showScreen("notice");
    }
    closingAr = false;
  }

  function exitArTo(screenName) {
    clearTimeout(scanTimer);
    els.fadeBlack?.classList.remove("is-on");
    els.arRoot.classList.remove("is-active");
    setArUi("none");
    showScreen(screenName);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
