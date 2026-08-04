# RAKUTEN QUEST AR モック

デバッグ用TOPから、複数種類のARモックを起動できる静的サイトです。

- ソース管理 / 公開: GitHub + GitHub Pages
- パネル高さ: 2.00m（表裏の静止画像）

## 公開 URL

- サイト: https://minasetan.github.io/fanpark-ar-mock/
- リポジトリ: https://github.com/minasetan/fanpark-ar-mock

## モック一覧

| # | 内容 | 対象 | AR方式 |
|---|---|---|---|
| (1) | 提案モック資料どおり（MAP→AR→スキャン→獲得） | Android Chrome | WebXR + DOM Overlay |
| (2) | AR確認のみ（UI / エフェクト付き） | Android Chrome | WebXR + DOM Overlay |
| (3) | AR確認のみ（閲覧専用） | iPhone Safari / Android Chrome | Quick Look / Scene Viewer |

## 使い方（実機）

1. 上記 URL をスマートフォンで開く
2. TOPから確認したいモックを選ぶ
3. (1)(2) は Android Chrome（WebXR対応端末）で確認する
4. (3) は iPhone Safari または Android Chrome で等身大パネルを確認する

AR の最終確認は HTTPS の公開 URL で行ってください。

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

WebXR はセキュアコンテキストが必要なため、AR起動の最終確認は GitHub Pages 上で行ってください。

## ファイル構成

```text
.
├── index.html                 # デバッグTOP
├── style.css
├── mocks/
│   ├── proposal/              # (1) 提案モック
│   ├── ar-android/            # (2) AR確認（Android / インタラクティブ）
│   └── ar-cross/              # (3) AR確認（iPhone / Android / 閲覧専用）
├── shared/
│   ├── css/ar-experience.css
│   └── js/
│       ├── config.js
│       └── ar-experience.js
└── assets/
    ├── character.glb
    ├── character.usdz
    └── character-poster.webp
```

## パネル差し替え

1. 表裏の透過 PNG を用意する
2. `tmp/panel/build_panel.py` で GLB / USDZ を再生成する
3. `assets/character-poster.webp` と `ATTRIBUTION.md` を更新する

詳細は [ATTRIBUTION.md](./ATTRIBUTION.md) を参照してください。

## GitHub Pages

公開元は `main` ブランチのルートです。`git push origin main` 後、数分で反映されます。
