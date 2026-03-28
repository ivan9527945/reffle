export const zhTW: Record<string, string> = {
  // ── Header ────────────────────────────────────────────────────────────────
  'nav.setup':         '設定抽獎',
  'nav.waiting':       '等待出礦',
  'nav.result':        '揭曉結果',
  'header.subtitle':   '比特幣區塊公平抽獎',
  'header.resetTitle': '清除資料',
  'header.restart':    '重新開始',

  // ── SetupView ─────────────────────────────────────────────────────────────
  'setup.hero.titleStart':     '公平抽獎，',
  'setup.hero.titleHighlight': '由比特幣決定',
  'setup.hero.desc':
    '指定未來一個比特幣區塊，當礦工出礦時，用區塊 hash 決定得獎者。結果完全公開、可驗證，任何人都能自行計算確認。',

  'setup.steps.0': '📝 輸入參與名單',
  'setup.steps.1': '🔗 等待出礦',
  'setup.steps.2': '🏆 Hash 決定贏家',

  'setup.raffleName':        '抽獎名稱',
  'setup.raffleNamePlaceholder': '例：2024 年度員工抽獎',
  'setup.participants':      '參與者名單',
  'setup.participantCount':  '（{{count}} 人）',
  'setup.addOne':            '逐一輸入',
  'setup.batchPaste':        '批量貼上',
  'setup.namePlaceholder':   '輸入名字後按 Enter 或點加入',
  'setup.add':               '加入',
  'setup.batchPlaceholder':  '每行一個名字，或用逗號分隔：\nAlice\nBob\nCharlie\n\n或：Alice, Bob, Charlie',
  'setup.importList':        '匯入名單',
  'setup.noParticipants':    '尚未加入任何參與者',
  'setup.targetBlock':       '開獎區塊高度',
  'setup.blockPlaceholder':  '輸入區塊高度...',
  'setup.suggestNext':       '推薦下一個 ⚡',
  'setup.blockMinedWarning': '⚠️ 此區塊已出礦，請選擇更高的區塊',
  'setup.blockETA':          '⏱ {{left}} 個區塊後開獎，預計 {{eta}} 後',
  'setup.btcInfo':
    '比特幣平均每 10 分鐘出一個區塊。建議選未來 6 個以上確保安全。',
  'setup.connecting': '連線中...',
  'setup.lockBtn':    '🔒 鎖定名單，開始等待出礦',

  'setup.whyFair.title':               '⚙️ 為什麼這樣設計是公平的？',
  'setup.whyFair.unpredictable.title': '無法預測',
  'setup.whyFair.unpredictable.body':
    '比特幣區塊 hash 由全球礦工競爭產出，任何人（包含主辦方）都無法提前知道結果。',
  'setup.whyFair.verifiable.title':    '可公開驗證',
  'setup.whyFair.verifiable.body':
    '任何人都可以在 mempool.space 查到區塊 hash，自行計算 hash mod 人數確認結果正確。',
  'setup.whyFair.tamperProof.title':   '不可竄改',
  'setup.whyFair.tamperProof.body':
    '名單鎖定後不可更動，配合區塊 hash，主辦方無法干預或造假結果。',

  'setup.formula.title':        '📐 開獎計算公式',
  'setup.formula.desc':         '出礦後，任何人都可以用以下公式自行驗算：',
  'setup.formula.step1.label':  '① 取得 hash',
  'setup.formula.step1.desc':   '→ 至 mempool.space 查詢指定區塊的 Block Hash',
  'setup.formula.step2.label':  '② 轉為數字',
  'setup.formula.step3.label':  '③ 取餘數',
  'setup.formula.step3.suffix': '← 得到名單索引 (0-based)',
  'setup.formula.countVar':     '人數',
  'setup.formula.step4.label':  '④ 對應得獎者',
  'setup.formula.indexVar':     '索引',

  // ── WaitingView ───────────────────────────────────────────────────────────
  'waiting.title':         '等待礦工出礦',
  'waiting.subtitle':      '「{{title}}」— 等待區塊 #{{block}} 出礦',
  'waiting.countdown':     '開獎倒數',
  'waiting.blocksLeft':    '區塊剩餘',
  'waiting.estimatedTime': '預計時間',
  'waiting.locked':        '鎖定 #{{block}}',
  'waiting.target':        '目標 #{{block}}',
  'waiting.latestBlock':   '最新區塊',
  'waiting.updatedAt':     '更新於 {{time}}',
  'waiting.waiting':       '等待中...',
  'waiting.websocket':     'WebSocket 即時更新',
  'waiting.lockedList':    '已鎖定名單',
  'waiting.people':        '{{count}} 人',

  'waiting.formula.title':         '📐 開獎計算公式',
  'waiting.formula.desc':          '出礦後，任何人都可以用以下步驟自行驗算：',
  'waiting.formula.step1.label':   '① 取得 hash',
  'waiting.formula.step1.desc':    '→ 至 mempool.space 查詢區塊 #{{block}} 的 Block Hash',
  'waiting.formula.step2.label':   '② 轉為數字',
  'waiting.formula.step3.label':   '③ 取餘數',
  'waiting.formula.step3.suffix':  '← 得到索引 0 ～ {{max}}',
  'waiting.formula.step4.label':   '④ 對應得獎者',
  'waiting.formula.step4.suffix':  '← 名單第 1 位索引為 0',
  'waiting.formula.indexVar':      '索引',

  // ── ResultView ────────────────────────────────────────────────────────────
  'result.mined':   '區塊出礦！',
  'result.decided': '比特幣網路已決定得獎者',
  'result.winner':  '得獎者',
  'result.from':    '從 {{count}} 位參與者中，由比特幣區塊 #{{block}} 決出',

  'result.proof.title':       '🔍 可驗證計算過程',
  'result.proof.drawBlock':   '開獎區塊',
  'result.proof.blockHash':   '區塊 Hash',
  'result.proof.calcProcess': '計算過程',
  'result.allParticipants':   '所有參與者（依抽籤順序）',

  'result.verifier.title':       '🧮 自行驗算工具',
  'result.verifier.desc':
    '任何人都可以貼上區塊 hash 與名單，在此頁面獨立驗算結果是否相符。不需要信任任何人。',
  'result.verifier.hashLabel':   '區塊 Hash（從 mempool.space 取得）',
  'result.verifier.listLabel':   '名單（每行一個，順序需與原始名單一致）',
  'result.verifier.run':         '▶ 執行驗算',
  'result.verifier.calcSteps':   '計算步驟',
  'result.verifier.match':       '✅ 驗算結果與本次抽獎完全吻合！得獎者：{{winner}}',
  'result.verifier.invalidHash': '❌ 無效的 hash 格式。Bitcoin 區塊 hash 為 64 位十六進位字元。',
  'result.verifier.tooFew':      '❌ 請輸入至少 2 個名字。',
  'result.verifier.mismatch':    '❌ 結果不符！可能是名單順序有誤。計算出：{{calc}}，本次記錄：{{actual}}',
  'result.verifier.diffHash':    '⚠️ 此 hash 與本次開獎區塊不同，但計算正確。得獎者：{{winner}}',
  'result.verifier.done':        '計算完成。得獎者：{{winner}}（第 {{index}} 位）',

  'result.copy':      '📋 複製驗證資訊',
  'result.verify':    '🔗 在 mempool.space 驗證',
  'result.newRaffle': '₿ 新建一次抽獎',

  // ── Calc steps (code block comments) ─────────────────────────────────────
  'calc.step1Comment': '1. 取得區塊 hash（十六進位）',
  'calc.step2Comment': '2. 轉換為大整數',
  'calc.step3Comment': '3. 取模（除以參與人數取餘數）',
  'calc.step4Comment': '4. 得出得獎者（從 0 開始計算）',
  'calc.winner':       'winner',
  'calc.index':        'index',

  // ── Copy text ─────────────────────────────────────────────────────────────
  'copy.header':           '【BTC Raffle 公平抽獎驗證】',
  'copy.raffleName':       '抽獎名稱:',
  'copy.drawBlock':        '開獎區塊:',
  'copy.blockHash':        '區塊 Hash:',
  'copy.participantCount': '參與人數:',
  'copy.winner':           '得獎者: {{winner}}（第 {{index}} 位，從 0 計算）',
  'copy.verifyMethod':     '驗算方式:',
  'copy.verifyStep1':      '1. 到 {{url}} 確認區塊',
  'copy.verifyStep2':      '2. 執行: BigInt("0x" + blockHash) % {{count}}n',
  'copy.verifyStep3':      '3. 結果為 {{index}}，對應名單第 {{index}} 位：{{winner}}',
  'copy.participantList':  '參與名單（依序）:',

  // ── Toast ─────────────────────────────────────────────────────────────────
  'toast.alreadyInList': '"{{name}}" 已在名單中',
  'toast.added':         '已加入 {{count}} 人',
  'toast.blockMined':    '目標區塊已出礦，請重新選擇',
  'toast.noConnection':  '無法連線到比特幣網路',
  'toast.copied':        '✅ 已複製驗證資訊',
}
