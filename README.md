# キャラクター AR モック

スマートフォンのブラウザから、人物キャラクターを現実空間に配置して確認できる静的 AR モックです。

- iPhone（Safari）: Apple Quick Look（USDZ）
- Android（Chrome）: Google Scene Viewer（GLB）
- Web プレビュー: [`<model-viewer>`](https://modelviewer.dev/)
- ホスティング: GitHub Pages（HTTPS）

## 公開 URL

- サイト: https://minasetan.github.io/fanpark-ar-mock/
- リポジトリ: https://github.com/minasetan/fanpark-ar-mock

## 使い方（実機）

1. 上記 URL を iPhone Safari または Android Chrome で開く
2. ページ上の 3D プレビューで確認する
3. 「ARで表示」を押す
4. 端末を動かして地面を認識し、キャラクターを配置する

QR コードが必要な場合は、公開 URL を任意の QR 生成サービスに渡せば利用できます。

## ローカル確認

静的ファイルのみなので、任意のローカルサーバーで開けます。

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

AR 起動自体は実機 + HTTPS（または一部環境での特別な設定）が必要です。最終確認は GitHub Pages の HTTPS URL で行ってください。

## ファイル構成

```text
.
├── index.html
├── style.css
├── README.md
├── ATTRIBUTION.md
├── LICENSE
└── assets/
    ├── character.glb
    ├── character.usdz
    └── character-poster.webp
```

## モデル差し替え

1. `assets/character.glb` と `assets/character.usdz` を置き換える
2. 必要なら `assets/character-poster.webp` も更新する
3. `ATTRIBUTION.md` を更新する

モック用モデルの出典は [ATTRIBUTION.md](./ATTRIBUTION.md) を参照してください。

## GitHub Pages 設定

1. このリポジトリを GitHub に push する
2. Settings → Pages
3. Source: `Deploy from a branch`
4. Branch: `main` / folder: `/ (root)`
5. 数分待って HTTPS URL を開く
