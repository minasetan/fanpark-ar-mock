# アセットの出典・ライセンス

## 等身大パネル

- 内容: 選手写真を用いた両面等身大パネル（高さ 1.80m）
- 表画像: `player_ar_standing_front_01`
- 裏画像: `player_ar_standing_back_01`
- 本リポジトリでの加工:
  - 黒背景を透過し、被写体領域でクロップ
  - Blender で薄い両面パネルメッシュを作成
  - Android / Web 用 `character.glb`、iPhone 用 `character.usdz`（Y-up）を書き出し

写真素材の利用権限は、本モックの発注・運用側で確保している前提です。

## Web ライブラリ

- [`@google/model-viewer`](https://modelviewer.dev/)（CDN 経由で読み込み）
