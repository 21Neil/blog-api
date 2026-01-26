# 📖 Blog-API(Node.js/Express)

這是一個功能完整的部落格後端API，整合了高效的影像處理流程、混合式雲端儲存機制（Public/Private Bucket）以及完整的身份驗證系統。

## 🛠 技術棧

- Backend: Express.js
- Database: Prisma ORM (PostgreSQL)
- Storage: Cloudflare R2 (S3 Compatible)
- Media Processing: Sharp
- Security: Passport.js (JWT/Local), bcrypt

## ✨ 核心特色

### 1. 混合式影像儲存系統 (Mixed R2 Storage)

為了兼顧效能與隱私，系統將圖片區分為兩種儲存模式：

公開圖片 (Published)： 存於公開 Bucket，API 直接回傳 Cloudflare R2 的 CDN 連結，減輕後端流量負擔。

私有圖片 (Draft/Private)： 存於私有 Bucket。前端需透過 API 請求，由後端驗證權限後生成 Presigned URL，確保未授權使用者無法存取。

### 2. 自動化影像最佳化 (Sharp Processing)

所有使用者上傳的圖片都會進入處理管道：

自動縮放： 寬度統一限制在 1080px（等比例縮放）。

格式轉換： 統一轉檔為 WebP 以大幅降低檔案大小。

效能優化： 減少前端載入負擔，提升 SEO 表現。

### 3. 嚴謹的安全機制

密碼保護： 使用 bcrypt 進行高強度雜湊加密，確保資料庫遭洩漏時密碼安全。

身份驗證： 整合 Passport.js 策略，支援 JWT 驗證與 Session 管理，實現細粒度的權限控制。

### 4. 自動排程清理圖片

系統內建排程任務，於每日凌晨 4:00 (UTC+8) 自動掃描 R2 儲存庫：

孤立文件檢測： 比對資料庫與 R2 中的 Key，找出已上傳但未被任何文章引用的「孤立圖片」。

成本控管： 自動刪除無效資源，有效節省 R2 儲存空間並降低成本。

## 📁 專案結構

```
prisma
├── migrations        ＃ 資料庫遷移紀錄
└── schema.prisma     ＃ 資料庫模型定義
scripts
└── hashPassword.js   ＃ 手動生成加密密碼
src
├── controllers       ＃ 業務邏輯入口
├── middleware        ＃ 中間件：身份驗證跟JWT策略
├── routes            ＃ 路由定義
├── services          ＃ 核心邏輯層
├── tasks             ＃ 排程任務：定期清理為引用圖片
├── utils             ＃ 通用工具
└── app.js            ＃ 應用程式入口
package-lock.json
package.json
test_api.sh
README.md
```

## 🔑 環境變數設定 (.env)

請在根目錄建立 .env 並參考以下設定：

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog"
# Auth
JWT_SECRET="your_jwt_secret"
# API URL
API_BASE_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_ENDPOINT="your_endpoint_url"
R2_PUBLIC_BUCKET_NAME="public-blog-images"
R2_PRIVATE_BUCKET_NAME="private-blog-images"

# CORs origin
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

## 🛰 主要 API 端點範例

### 🔐 身份驗證 (Authentication)

| 方法 | 路徑                  | 說明                     | 驗證 |
| :--- | :-------------------- | :----------------------- | :--- |
| POST | /api/auth/login       | 使用者登入並取得身份憑證 | 🔓   |
| GET  | /api/auth/check-login | 驗證目前 Token 是否有效  | 🔐   |

### 🌍 前台公開接口 (Public Posts)

| 方法 | 路徑                    | 說明                         | 驗證 |
| :--- | :---------------------- | :--------------------------- | :--- |
| GET  | /api/posts              | 取得所有「已發布」的文章列表 | 🔓   |
| GET  | /api/posts/:id          | 取得單一公開文章詳細內容     | 🔓   |
| POST | /api/posts/:id/comments | 訪客發表文章評論             | 🔓   |

### 🛠 後台管理接口 (Admin Panel)

| 方法   | 路徑                                  | 說明                                     | 驗證 |
| :----- | :------------------------------------ | :--------------------------------------- | :--- |
| POST   | /api/admin/posts                      | 建立文章：含封面圖 Sharp 壓縮並上傳 R2   | 🔐   |
| POST   | /api/admin/posts/upload-content-image | 內文插圖：上傳至 R2 私有儲存庫           | 🔐   |
| GET    | /api/admin/posts/images/:key          | 安全讀取：取得 R2 私有圖片的預簽連結     | 🔐   |
| DELETE | /api/admin/posts/:id                  | 連動刪除：刪除文章時同步移除 R2 雲端檔案 | 🔐   |

## 🚀 快速開始

1. 安裝依賴
```
npm install
```

2.資料庫同步
```
npx prisma generate
npx prisma db push
```

3.啟動開發伺服器
```
npm run dev
```
