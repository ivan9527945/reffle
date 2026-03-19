# BTC Raffle — 比特幣區塊公平抽獎

利用比特幣區塊雜湊值作為隨機源，進行可公開驗證的公平抽獎。

## 開獎原理

```
得獎者 = 參與者列表[BigInt("0x" + 區塊雜湊) % BigInt(參與人數)]
```

任何人都可以用區塊雜湊自行驗算，結果完全透明、不可竄改。

## 開發指令

```bash
npm install
npm run dev       # 開發伺服器
npm run build     # 型別檢查 + 打包
npm run lint      # ESLint
npm run preview   # 預覽打包結果
```

## 專案架構

```
src/
├── components/
│   ├── SetupView.tsx     # 設定抽獎（參與者、目標區塊）
│   ├── WaitingView.tsx   # 等待區塊挖出（倒數進度）
│   ├── ResultView.tsx    # 公布得獎者與驗算工具
│   ├── Header.tsx        # 頂部導覽列（即時區塊高度）
│   ├── Toast.tsx         # 通知系統
│   └── ui/               # 基礎元件（Button、Card、Input…）
├── hooks/
│   ├── useRaffle.ts      # 抽獎狀態 + localStorage 持久化
│   ├── useBitcoin.ts     # 輪詢 Mempool.space API
│   └── useConfetti.ts    # 得獎慶祝動畫
├── lib/
│   ├── bitcoin.ts        # Mempool.space API 呼叫
│   └── utils.ts          # 得獎計算、格式化、驗證
├── types/index.ts        # TypeScript 型別定義
└── styles/globals.scss   # 全域樣式與 CSS 變數
```

### 頁面流程

```
SetupView → (鎖定抽獎) → WaitingView → (區塊挖出) → ResultView
```

### 狀態管理

使用 `useRaffle` hook 搭配 `localStorage`（key: `btc-raffle-v2`），不依賴 Redux/Zustand，頁面重整後狀態自動恢復。

### Bitcoin API

串接 [Mempool.space](https://mempool.space) 公開 API（無需金鑰），每 30 秒輪詢一次：

- `GET /blocks/tip/height` — 當前區塊高度
- `GET /block-height/{height}` — 指定高度的區塊雜湊

## 技術棧

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Radix UI**
- **Lucide React**（圖示）、**class-variance-authority**（元件變體）
