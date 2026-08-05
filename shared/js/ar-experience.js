import {
  PLAYER,
  AR_ORIENTATION_CONTRACT,
  MAP_PLAYERS,
  STORAGE_KEY,
  RESUME_SCREEN_KEY,
  PLACEMENT_DISTANCE_M,
  TIMING,
} from "./config.js";

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
    pinsRoot: document.getElementById("player-pins"),
    mapCleared: document.getElementById("map-cleared"),
    mapHint: document.getElementById("map-hint"),
    footprint: document.getElementById("footprint"),
    placementMask: document.getElementById("placement-mask"),
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
  /** @type {string|null} */
  let activePlayerId = null;

  fillCopy();
  renderMapPins();
  bindUi();
  updateMapPins();
  setArUi("none");

  // WebXR終了後に透明オーバーレイが残ることがあるため、ARからの復帰はリロードで行う
  const resumeScreen = sessionStorage.getItem(RESUME_SCREEN_KEY);
  if (resumeScreen) {
    sessionStorage.removeItem(RESUME_SCREEN_KEY);
    showScreen(resumeScreen);
  } else if (mode === "ar-only") {
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
    applyArOrientationContract();
  }

  /**
   * Apply the locked WebXR model + orientation. Never change src mid-session.
   */
  function applyArOrientationContract() {
    if (!els.viewer) return;
    els.viewer.src = AR_ORIENTATION_CONTRACT.modelSrc;
    els.viewer.setAttribute("orientation", AR_ORIENTATION_CONTRACT.orientation);
    els.viewer.poster = PLAYER.posterSrc;
  }

  function renderMapPins() {
    if (!els.pinsRoot || mode !== "proposal") return;
    els.pinsRoot.innerHTML = "";
    MAP_PLAYERS.forEach((player) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "player-pin";
      btn.dataset.playerId = player.id;
      btn.textContent = player.label;
      btn.setAttribute("aria-label", `選手 ${player.label}`);
      btn.style.setProperty("--pin-x", `${player.x}%`);
      btn.style.setProperty("--pin-y", `${player.y}%`);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        selectPlayer(player.id);
      });
      els.pinsRoot.appendChild(btn);
    });
  }

  function selectPlayer(playerId) {
    if (getCollectedIds().has(playerId)) return;
    activePlayerId = playerId;
    showScreen("notice");
  }

  function bindUi() {
    // Block XR grab/move; floor placement is automatic (no user tap).
    const blockXrSelect = (event) => {
      event.preventDefault();
    };
    els.overlay?.addEventListener("beforexrselect", blockXrSelect);
    els.viewer?.addEventListener("beforexrselect", blockXrSelect);

    document.getElementById("btn-start")?.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("map");
    });

    document.getElementById("btn-reset-collection")?.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem(STORAGE_KEY);
      activePlayerId = null;
      updateMapPins();
    });

    document.getElementById("btn-start-ar")?.addEventListener("click", (e) => {
      e.preventDefault();
      startArFlow();
    });

    document.getElementById("btn-back-map")?.addEventListener("click", (e) => {
      e.preventDefault();
      activePlayerId = null;
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
    if (name === "map") updateMapPins();
  }

  function getCollectedIds() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map(String));
    } catch {
      return new Set();
    }
  }

  function markCollected(playerId) {
    if (!playerId) return;
    const next = getCollectedIds();
    next.add(String(playerId));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }

  function updateMapPins() {
    if (mode !== "proposal") return;
    const collected = getCollectedIds();
    const pins = els.pinsRoot?.querySelectorAll(".player-pin") || [];
    pins.forEach((pin) => {
      const id = pin.dataset.playerId;
      pin.hidden = collected.has(id);
    });

    const allCleared = collected.size >= MAP_PLAYERS.length;
    if (els.mapCleared) els.mapCleared.hidden = !allCleared;
    if (els.mapHint) {
      if (allCleared) {
        els.mapHint.textContent = "全選手を獲得済みです。やり直すか、TOPへ戻ってください。";
      } else if (collected.size > 0) {
        els.mapHint.textContent = `獲得済み: ${[...collected].sort().join(", ")} ／ 残りの番号をタップしてARへ`;
      } else {
        els.mapHint.textContent =
          "番号アイコンをタップするとARへ進みます。お別れ後、その番号はMAPから消えます。";
      }
    }
  }

  async function startArFlow() {
    if (mode === "proposal" && !activePlayerId) {
      showScreen("map");
      return;
    }

    const supported = await canUseWebXr();
    if (!supported) {
      showScreen("unsupported");
      return;
    }

    Object.values(els.screens).forEach((el) => el?.classList.remove("is-active"));
    if (els.arRoot) {
      els.arRoot.style.pointerEvents = "";
      els.arRoot.style.visibility = "";
      els.arRoot.classList.add("is-active", "ar-booting");
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

  function revealArViewer() {
    els.arRoot?.classList.remove("ar-booting");
  }

  function getArInternals() {
    const mv = els.viewer;
    if (!mv) return { scene: null, arRenderer: null };
    let scene = null;
    let arRenderer = null;
    try {
      for (const sym of Object.getOwnPropertySymbols(mv)) {
        const val = mv[sym];
        if (!val || typeof val !== "object") continue;
        if (val.arRenderer) arRenderer = val.arRenderer;
        if (val.scenes && val.arRenderer) arRenderer = val.arRenderer;
        if (val.scenePivot) scene = val;
        if (val.scene?.scenePivot) scene = val.scene;
        if (val.presentedScene?.scenePivot) scene = val.presentedScene;
      }
      if (!scene && arRenderer?.presentedScene) {
        scene = arRenderer.presentedScene;
      }
      if (!arRenderer) {
        for (const sym of Object.getOwnPropertySymbols(mv)) {
          const val = mv[sym];
          if (val?.arRenderer?.presentedScene) {
            arRenderer = val.arRenderer;
            scene = scene || val.arRenderer.presentedScene;
          }
        }
      }
    } catch (err) {
      console.warn("getArInternals failed", err);
    }
    return { scene, arRenderer };
  }

  function hidePlacementBox() {
    try {
      const { arRenderer } = getArInternals();
      if (arRenderer?.placementBox) {
        arRenderer.placementBox.show = false;
        if ("visible" in arRenderer.placementBox) {
          arRenderer.placementBox.visible = false;
        }
      }
    } catch (err) {
      console.warn("hidePlacementBox failed", err);
    }
  }

  /**
   * Best-effort: pull the placed model to ~PLACEMENT_DISTANCE_M in front of the camera.
   */
  function adjustPlacementDistance(meters) {
    try {
      const { scene, arRenderer } = getArInternals();
      if (!scene?.scenePivot || typeof scene.getCamera !== "function") {
        return false;
      }

      const cam = scene.getCamera();
      const pivot = scene.scenePivot;
      const y = pivot.position.y;
      let dx = pivot.position.x - cam.position.x;
      let dz = pivot.position.z - cam.position.z;
      let len = Math.hypot(dx, dz);
      if (len < 0.05) {
        const m = cam.matrixWorld?.elements;
        if (m) {
          dx = -m[8];
          dz = -m[10];
          len = Math.hypot(dx, dz) || 1;
        } else {
          return false;
        }
      }
      dx /= len;
      dz /= len;
      const nx = cam.position.x + dx * meters;
      const nz = cam.position.z + dz * meters;
      pivot.position.set(nx, y, nz);
      if (arRenderer?.goalPosition?.set) {
        arRenderer.goalPosition.set(nx, y, nz);
      }
      return true;
    } catch (err) {
      console.warn("adjustPlacementDistance failed", err);
      return false;
    }
  }

  function enterPlayerUi() {
    revealArViewer();
    hidePlacementBox();
    adjustPlacementDistance(PLACEMENT_DISTANCE_M);
    requestAnimationFrame(() => {
      adjustPlacementDistance(PLACEMENT_DISTANCE_M);
    });
    setArUi("player");
    state = "player";
  }

  function onArStatus(event) {
    const status = event.target.getAttribute("ar-status") || event.detail?.status;
    if (closingAr) return;
    if (status === "failed") {
      exitArTo("unsupported");
      return;
    }
    if (status === "session-started") {
      // Same locked model from session start; camera stays visible with a light hint.
      revealArViewer();
      if (state === "floor") {
        setArUi("floor");
        hidePlacementBox();
      }
      return;
    }
    if (status === "object-placed" && state === "floor") {
      enterPlayerUi();
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

    // Footprint/tap guide is unused; auto-placement uses the locked player model + light hint.
    setHidden(els.footprint, true);
    setHidden(els.placementMask, !floor);
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

    // Block XR grabs for the whole AR experience (placement is automatic).
    els.overlay?.classList.toggle("is-blocking", phase !== "none");
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

    // お別れ完了時に、タップした番号だけMAPから消す
    if (mode === "proposal") {
      markCollected(activePlayerId);
    }

    els.fadeBlack?.classList.add("is-on");
    await wait(Math.min(TIMING.fadeMs, 400));

    // ARセッション残骸でMAPが触れなくなるのを避けるため、リロードで復帰する
    hardReturnTo(mode === "proposal" ? "map" : "notice");
  }

  function forceLeaveAr() {
    clearScanTimers();
    els.fadeBlack?.classList.remove("is-on");
    els.glowFlash?.classList.remove("is-on");
    els.arRoot?.classList.remove("is-active", "ar-booting");
    setArUi("none");
    applyArOrientationContract();
    if (els.arRoot) {
      els.arRoot.style.pointerEvents = "none";
      els.arRoot.style.visibility = "hidden";
      els.arRoot.style.display = "none";
    }
    if (els.overlay) {
      els.overlay.classList.remove("is-blocking");
    }
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  function hardReturnTo(screenName) {
    try {
      els.viewer?.exitAR?.();
    } catch {
      // ignore
    }
    forceLeaveAr();
    sessionStorage.setItem(RESUME_SCREEN_KEY, screenName);
    window.location.replace(window.location.pathname + window.location.search);
  }

  function exitArTo(screenName) {
    if (closingAr) return;
    closingAr = true;
    // 途中離脱でも WebXR 残骸で操作不能になりやすいのでリロード復帰する
    if (screenName === "map" || screenName === "notice") {
      hardReturnTo(screenName);
      return;
    }
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
