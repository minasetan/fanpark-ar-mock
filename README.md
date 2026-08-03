# 等身大パネル AR モック

スマートフォンのブラウザから、選手の等身大パネルを現実空間に配置して確認できる静的 AR モックです。

- iPhone（Safari）: Apple Quick Look（USDZ）
- Android（Chrome）: Google Scene Viewer（GLB）
- Web プレビュー: [`<model-viewer>`](https://modelviewer.dev/)
- ソース管理 / 公開: GitHub + GitHub Pages
- パネル高さ: 2.00m（表裏の静止画像）

## 公開 URL

- サイト: https://minasetan.github.io/fanpark-ar-mock/
- リポジトリ: https://github.com/minasetan/fanpark-ar-mock

## 使い方（実機）

1. 上記 URL を iPhone Safari または Android Chrome で開く
2. ページ上のプレビューで表裏を回転して確認する
3. 「ARで表示」を押す
4. 端末を動かして地面を認識し、等身大パネルを配置する

QR コードが必要な場合は、公開 URL を任意の QR 生成サービスに渡せば利用できます。

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

AR の最終確認は HTTPS の公開 URL で行ってください。

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

## パネル差し替え

1. 表裏の透過 PNG を用意する
2. `tmp/panel/build_panel.py` で GLB / USDZ を再生成する（または同等の手順）
3. `assets/character-poster.webp` と `ATTRIBUTION.md` を更新する

詳細は [ATTRIBUTION.md](./ATTRIBUTION.md) を参照してください。

## GitHub Pages

公開元は `main` ブランチのルートです。`git push origin main` 後、数分で反映されます。
