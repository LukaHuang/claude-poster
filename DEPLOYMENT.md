# GitHub Pages 部署指南

## 🎯 推薦方式：GitHub Actions 自動部署

已配置完整的 GitHub Actions workflow，每次 push 到 `main` 分支自動部署。

### 優勢
✅ 完全自動化  
✅ 有部署日誌追蹤  
✅ 支援 npm cache 加速建置  
✅ 避免並發部署衝突  
✅ 任何裝置都能觸發部署  

---

## 🚀 快速開始

### 1️⃣ 啟用 GitHub Pages

前往 Repository Settings：
```
https://github.com/LukaHuang/fb-poster/settings/pages
```

設定：
- **Source**: `GitHub Actions` ⚠️ 必須選這個！
- **Custom domain**: `tool.luka.tw`
- **Enforce HTTPS**: ✅ 勾選

### 2️⃣ 設定 DNS

在你的 DNS 供應商（Cloudflare）新增：

```
Type: CNAME
Name: tool
Value: lukahuang.github.io
```

### 3️⃣ 部署

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

🎉 GitHub Actions 會自動建置並部署！

### 4️⃣ 查看部署狀態

```
https://github.com/LukaHuang/fb-poster/actions
```

---

## 📋 部署後的網址

- **自訂網域**: https://tool.luka.tw/fb-poster
- **GitHub 網址**: https://lukahuang.github.io/fb-poster

---

## 🔧 日常開發流程

```bash
# 1. 開發
npm run dev

# 2. 測試建置
npm run build

# 3. 提交代碼
git add .
git commit -m "Add new feature"

# 4. 推送（自動觸發部署）
git push origin main

# 5. 等待 1-2 分鐘，查看 Actions 頁面
# https://github.com/LukaHuang/fb-poster/actions
```

---

## ⏱️ 部署時間

預計每次部署時間：
- 安裝依賴：~30 秒（有 cache）
- 建置：~30 秒
- 部署：~10 秒
- **總計**：約 1-2 分鐘

---

## 🐛 故障排除

### 部署失敗

1. 檢查 [Actions 日誌](https://github.com/LukaHuang/fb-poster/actions)
2. 確認本地 `npm run build` 可以成功
3. 確認 GitHub Pages Source 設定為 "GitHub Actions"

### 網站無法訪問

1. 等待 DNS 傳播（可能需要幾分鐘）
2. 檢查 `public/CNAME` 檔案內容是否為 `tool.luka.tw`
3. 確認 DNS 設定正確：`dig tool.luka.tw`
4. 在 GitHub Pages 設定中重新輸入自訂網域

### 樣式或資源載入失敗

1. 檢查 `vite.config.js` 中的 `base` 設定
2. 目前設定：`base: '/fb-poster/'`
3. 確認所有資源路徑都是相對路徑

---

## 🆚 替代方案：手動部署（不推薦）

如果你堅持要使用 `gh-pages` 套件手動部署：

### 恢復手動部署

```bash
# 1. 在 package.json 加回 deploy 指令
npm pkg set scripts.predeploy="npm run build"
npm pkg set scripts.deploy="gh-pages -d dist"

# 2. 每次手動執行
npm run deploy
```

### 手動部署的缺點

❌ 需要每次記得執行  
❌ 多人協作容易遺漏  
❌ 需要本機環境配置正確  
❌ 無部署歷史記錄  

---

## 💡 建議

對於這個專案，強烈建議使用 **GitHub Actions 自動部署**：

1. ✅ 你已經有完整的 workflow 設定
2. ✅ 建置時間很短（約 1 分鐘）
3. ✅ 免費額度足夠（每月 2000 分鐘）
4. ✅ 完全自動化，省時省力
5. ✅ 有完整的部署日誌可追蹤

只需要在 GitHub 設定頁面選擇 "GitHub Actions" 作為 Source，之後就完全自動化了！

---

## 📊 GitHub Actions 配置說明

workflow 檔案位置：`.github/workflows/gh-pages.yml`

特點：
- ✅ npm cache 加速安裝
- ✅ 並發控制避免衝突
- ✅ 環境 URL 自動顯示
- ✅ 使用最新的 Actions v4

