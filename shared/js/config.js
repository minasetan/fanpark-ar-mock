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
  { id: "1", label: "1", x: 22, y: 28 },
  { id: "2", label: "2", x: 72, y: 24 },
  { id: "3", label: "3", x: 48, y: 48 },
  { id: "4", label: "4", x: 28, y: 72 },
  { id: "5", label: "5", x: 68, y: 70 },
];

export const STORAGE_KEY = "rq_collected_players";

export const TIMING = {
  scanMs: 1600,
  glowMs: 700,
  fadeMs: 650,
};
