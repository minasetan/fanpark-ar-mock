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
