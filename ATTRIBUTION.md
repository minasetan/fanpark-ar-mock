# アセットの出典・ライセンス

## 3Dキャラクター

- モデル名: Adventurer（Ultimate Modular Men Pack）
- 作者: [Quaternius](https://quaternius.com/)
- 配布: [Poly Pizza](https://poly.pizza/m/5EGWBMpuXq)
- ライセンス: [CC0 1.0 Universal (Public Domain)](https://creativecommons.org/publicdomain/zero/1.0/)
- 本リポジトリでの加工:
  - アニメーションは `Wave` のみ残し、名前を `Idle` に変更（他 23 本と未参照のバッファを削除）
  - Android 用 GLB は元スケールのまま（身長 約 1.83m、足元接地）
  - iPhone 用 USDZ は Quick Look 向けにポーズをベイクした静的メッシュとして書き出し（Y-up / 1m単位 / 非メタル）
  - Web プレビューでは Idle アニメーションが再生される
  - ポスター画像は Blender でレンダリング

CC0 のため帰属表示は必須ではありませんが、作者への感謝として記載しています。

## Web ライブラリ

- [`@google/model-viewer`](https://modelviewer.dev/)（CDN 経由で読み込み）
