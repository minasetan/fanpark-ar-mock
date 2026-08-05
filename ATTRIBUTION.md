# アセットの出典・ライセンス

## 等身大パネル

- 内容: 選手写真を用いた両面等身大パネル（高さ 2.00m）
- 表画像: `player_ar_standing_front_01`
- 裏画像: `player_ar_standing_back_01`
- 本リポジトリでの加工:
  - 黒背景を透過し、被写体領域でクロップ
  - Blender で薄い両面パネルメッシュを作成
  - Android / Web 用 `character.glb`、iPhone 用 `character.usdz`（Y-up）を書き出し

写真素材の利用権限は、本モックの発注・運用側で確保している前提です。

## MAP背景

- ファイル: `assets/map-background.jpg`
- 内容: 球場周辺を俯瞰したイラストMAP
- 用途: 提案モックのMAP画面背景

## タイトル背景

- ファイル: `assets/title-background.jpg`
- 内容: RAKUTEN QUEST タイトル用キービジュアル
- 用途: 提案モックのタイトル画面背景

## Web ライブラリ

- [`@google/model-viewer`](https://modelviewer.dev/)（CDN 経由で読み込み）
