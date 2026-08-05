export const PLAYER = {
  id: "rakuten_taro",
  nameRomaji: "Rakuten Taro",
  nameJa: "楽天 太郎",
  introLine: "はじめまして 楽天 太郎です\n応援よろしく！",
  farewellLine: "また、会おう",
  acquiredLine: "楽天 太郎選手を入手した",
  registeredLine: "図鑑に登録しました",
  cardImage: "../../assets/character-poster.webp",
  modelSrc: "../../assets/character.glb",
  posterSrc: "../../assets/character-poster.webp",
};

/**
 * WebXR 向け選手パネルの向き契約（唯一の正）。
 *
 * - model-viewer の orientation / src は必ずここ経由で適用する
 * - character.glb は build_panel.py の compensate_webxr_upside_down 焼き込み前提
 * - WebXR セッション中に src を差し替えない（配置姿勢と合成が崩れ、上下・裏表が反転する）
 * - どちらかを変えたら Android Chrome 実機で「頭が上・表がカメラ向き」を確認すること
 *
 * @see README.md 「AR向き契約（WebXR）」
 */
export const AR_ORIENTATION_CONTRACT = {
  /** model-viewer `orientation`（pitch yaw roll） */
  orientation: "180deg 0 0",
  /** セッション開始〜終了まで使い続ける GLB（差し替え禁止） */
  modelSrc: PLAYER.modelSrc,
  /** 対応メッシュを出したおおよそのコミット（向き焼き込み入り） */
  meshBaseline: "a40027f",
};

/** MAP上の選手ピン（AR本体は共通） */
export const MAP_PLAYERS = [
  { id: "1", label: "1", x: 20, y: 42 }, // 左サイドのコート付近
  { id: "2", label: "2", x: 76, y: 22 }, // 右上の陸上トラック
  { id: "3", label: "3", x: 48, y: 50 }, // 中央の野球場
  { id: "4", label: "4", x: 30, y: 78 }, // 左下の駐車場
  { id: "5", label: "5", x: 70, y: 74 }, // 右下エリア
];

export const STORAGE_KEY = "rq_collected_players";
export const RESUME_SCREEN_KEY = "rq_resume_screen";

/** AR自動配置の目標距離（カメラ正面・水平方向・メートル） */
export const PLACEMENT_DISTANCE_M = 1.0;

export const TIMING = {
  scanMs: 1600,
  glowMs: 700,
  fadeMs: 650,
};
