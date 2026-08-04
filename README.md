# RAKUTEN QUEST AR モック

デバッグ用TOPから、複数種類のARモックを起動できる静的サイトです。

- ソース管理: GitHub
- 公開: GitHub Pages / Firebase Hosting（併用可）
- パネル高さ: 2.00m（表裏の静止画像）

## 公開 URL

- GitHub Pages: https://minasetan.github.io/fanpark-ar-mock/
- Firebase Hosting: デプロイ後に表示される `https://<project-id>.web.app`
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

## Firebase Hosting（試用）

このリポジトリは Firebase Hosting 向け設定済みです（`firebase.json`）。

### 1. コンソールでプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. **Firebase プロジェクトを設定して開始** を押す
3. プロジェクト名例: `fanpark-ar-mock`（ID が自動提案されます）
4. Google Analytics はモック用途なら **無効でも可**
5. 作成後、プロジェクト概要の歯車 → プロジェクトの設定 で **プロジェクト ID** を確認

プロジェクト ID が `.firebaserc` の `fanpark-ar-mock` と違う場合は、その ID に書き換えてください。

### 2. 初回だけローカル準備

```bash
cd /Users/y-kawada/Documents/workspace/sle/fanpark_mock
npm install
npx firebase login
npx firebase use <あなたのプロジェクトID>
```

### 3. デプロイ

```bash
npm run deploy
```

成功すると `https://<project-id>.web.app` が表示されます。  
Hosting 以外の Firebase プロダクトは不要です（無料枠内で十分な想定）。

プレビュー用チャネル（本番を汚さない確認）:

```bash
npm run deploy:preview
```

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

WebXR はセキュアコンテキストが必要なため、AR起動の最終確認は公開 HTTPS URL で行ってください。

## ファイル構成

```text
.
├── index.html                 # デバッグTOP
├── style.css
├── firebase.json              # Firebase Hosting 設定
├── .firebaserc                # デフォルトプロジェクト ID
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
    ├── character-poster.webp
    └── map-background.jpg
```

## パネル差し替え

1. 表裏の透過 PNG を用意する
2. `tmp/panel/build_panel.py` で GLB / USDZ を再生成する
3. `assets/character-poster.webp` と `ATTRIBUTION.md` を更新する

詳細は [ATTRIBUTION.md](./ATTRIBUTION.md) を参照してください。

## GitHub Pages

公開元は `main` ブランチのルートです。`git push origin main` 後、数分で反映されます。
