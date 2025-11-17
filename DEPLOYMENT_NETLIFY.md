# Netlify 部署指南

## 🚀 Netlify 部署設定完成

你的專案已配置為使用 Netlify 自動部署。

### 現在的設定

- **網址**: http://claude-poster.luka.tw
- **Repository**: github.com/LukaHuang/claude-poster
- **Production branch**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 22.x

---

## ✅ 已完成的配置

1. **netlify.toml** - Netlify 配置檔案
   - ✅ SPA 路由設定（所有路徑重定向到 index.html）
   - ✅ 快取優化（assets 永久快取，HTML 不快取）
   - ✅ 自動建置設定

2. **vite.config.js**
   - ✅ base 設定為 `/`（適合子網域）

3. **自訂網域**
   - ✅ 已在 Netlify 設定 `claude-poster.luka.tw`

---

## 🔧 部署流程

### 自動部署

每次 push 到 `main` 分支，Netlify 會自動：

```bash
git add .
git commit -m "Your changes"
git push origin main  # 自動觸發 Netlify 部署
```

### 部署時間

- 安裝依賴：~20-30 秒
- 建置：~20-30 秒
- 部署：~5-10 秒
- **總計**：約 1 分鐘

---

## 📋 Netlify 儀表板

- **部署狀態**: https://app.netlify.com/sites/claude-poster/deploys
- **網站設定**: https://app.netlify.com/sites/claude-poster/settings
- **網域設定**: https://app.netlify.com/sites/claude-poster/settings/domain

---

## 🌐 網址

- **自訂網域**: http://claude-poster.luka.tw
- **Netlify 網域**: https://claude-poster.netlify.app

---

## 🎯 Netlify 優勢

相較於 GitHub Pages：

✅ **更快的部署速度** - 約 1 分鐘完成  
✅ **即時預覽** - 每個 PR 自動產生預覽網址  
✅ **自動快取優化** - CDN 全球加速  
✅ **表單處理** - 內建表單功能  
✅ **函數支援** - Serverless Functions  
✅ **分支部署** - 可以部署多個分支  
✅ **Deploy Previews** - PR 自動產生預覽  
✅ **回滾功能** - 一鍵回滾到任何版本  

---

## 🔄 Pull Request 預覽

當你建立 Pull Request 時，Netlify 會自動：

1. 建立一個預覽部署
2. 在 PR 中留下預覽網址的評論
3. 每次更新 PR 時自動更新預覽

這讓你可以在合併前先預覽變更！

---

## 🛠️ 本地開發

```bash
# 開發模式
npm run dev

# 本地建置測試
npm run build

# 預覽建置結果
npm run preview
```

---

## 🐛 故障排除

### 部署失敗

1. 檢查 [Netlify 部署日誌](https://app.netlify.com/sites/claude-poster/deploys)
2. 確認本地 `npm run build` 可以成功
3. 檢查 `netlify.toml` 設定是否正確

### 網站無法訪問

1. 檢查 Netlify 儀表板中的部署狀態
2. 確認自訂網域 DNS 設定正確
3. 在 Netlify 設定中驗證網域

### 路由問題（404 錯誤）

- `netlify.toml` 中的 SPA 重定向設定應該已解決此問題
- 確保 `[[redirects]]` 設定存在

---

## ⚙️ 進階設定

### 環境變數

在 Netlify 儀表板設定環境變數：
```
https://app.netlify.com/sites/claude-poster/settings/deploys#environment-variables
```

### Build Hooks

可以建立 Build Hook 來觸發部署：
```
https://app.netlify.com/sites/claude-poster/settings/deploys#build-hooks
```

### 通知設定

設定部署通知（Slack、Email 等）：
```
https://app.netlify.com/sites/claude-poster/settings/notifications
```

---

## 📊 部署歷史

查看所有部署歷史和回滾：
```
https://app.netlify.com/sites/claude-poster/deploys
```

每個部署都可以：
- 查看建置日誌
- 預覽該版本
- 一鍵回滾

---

## 💡 提示

1. **分支部署**: 可以在 Netlify 設定中啟用其他分支的自動部署
2. **環境分離**: 使用不同的環境變數區分 production 和 preview
3. **效能優化**: Netlify 自動處理 HTTP/2、壓縮等優化
4. **HTTPS**: Netlify 自動提供 Let's Encrypt SSL 憑證

---

## 🆚 GitHub Actions vs Netlify

你現在使用 Netlify，相關的 GitHub Actions workflow 可以保留或移除：

### 保留 GitHub Actions（推薦）

如果你想要同時支援兩種部署方式，可以保留 `.github/workflows/gh-pages.yml`

### 移除 GitHub Actions

如果只用 Netlify，可以：
```bash
# 停用 GitHub Actions
mv .github/workflows/gh-pages.yml .github/workflows/gh-pages.yml.disabled
```

---

## 🎉 完成

你的專案現在會自動部署到 Netlify！

每次 push 到 `main` 分支，大約 1 分鐘後就能在 http://claude-poster.luka.tw 看到更新。
