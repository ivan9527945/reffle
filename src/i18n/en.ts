export const en: Record<string, string> = {
  // ── Header ────────────────────────────────────────────────────────────────
  'nav.setup':       'Setup Raffle',
  'nav.waiting':     'Waiting for Block',
  'nav.result':      'Reveal Result',
  'header.subtitle': 'Fair Bitcoin Block Raffle',
  'header.resetTitle': 'Clear Data',
  'header.restart':  'Restart',

  // ── SetupView ─────────────────────────────────────────────────────────────
  'setup.hero.titleStart':     'Fair Raffle, ',
  'setup.hero.titleHighlight': 'Decided by Bitcoin',
  'setup.hero.desc':
    'Pick a future Bitcoin block — when miners find it, the block hash determines the winner. Results are fully public and verifiable; anyone can compute it independently.',

  'setup.steps.0': '📝 Enter Participants',
  'setup.steps.1': '🔗 Wait for Block',
  'setup.steps.2': '🏆 Hash Decides Winner',

  'setup.raffleName':        'Raffle Name',
  'setup.raffleNamePlaceholder': 'e.g.: 2024 Annual Employee Raffle',
  'setup.participants':      'Participants',
  'setup.participantCount':  '({{count}} people)',
  'setup.addOne':            'Add One by One',
  'setup.batchPaste':        'Batch Paste',
  'setup.namePlaceholder':   'Type name then press Enter or click Add',
  'setup.add':               'Add',
  'setup.batchPlaceholder':  'One name per line, or comma-separated:\nAlice\nBob\nCharlie\n\nor: Alice, Bob, Charlie',
  'setup.importList':        'Import List',
  'setup.noParticipants':    'No participants added yet',
  'setup.targetBlock':       'Target Block Height',
  'setup.blockPlaceholder':  'Enter block height...',
  'setup.suggestNext':       'Suggest Next ⚡',
  'setup.blockMinedWarning': '⚠️ This block is already mined, please choose a higher block',
  'setup.blockETA':          '⏱ {{left}} blocks left, estimated {{eta}} from now',
  'setup.btcInfo':
    'Bitcoin averages one block every 10 minutes. Recommend choosing 6+ blocks ahead for safety.',
  'setup.connecting': 'Connecting...',
  'setup.lockBtn':    '🔒 Lock List, Start Waiting',

  'setup.whyFair.title':                  '⚙️ Why Is This Design Fair?',
  'setup.whyFair.unpredictable.title':    'Unpredictable',
  'setup.whyFair.unpredictable.body':
    'Bitcoin block hashes are produced by global miners competing; no one (including organizers) can know the result in advance.',
  'setup.whyFair.verifiable.title':       'Publicly Verifiable',
  'setup.whyFair.verifiable.body':
    'Anyone can look up the block hash at mempool.space and independently compute hash mod count to confirm the result.',
  'setup.whyFair.tamperProof.title':      'Tamper-Proof',
  'setup.whyFair.tamperProof.body':
    'The participant list is locked and cannot be changed. Combined with the block hash, organizers cannot manipulate the result.',

  'setup.formula.title':         '📐 Draw Calculation Formula',
  'setup.formula.desc':          'After the block is mined, anyone can verify using the following formula:',
  'setup.formula.step1.label':   '① Get hash',
  'setup.formula.step1.desc':    '→ Look up the Block Hash for the specified block on mempool.space',
  'setup.formula.step2.label':   '② Convert to number',
  'setup.formula.step3.label':   '③ Get remainder',
  'setup.formula.step3.suffix':  '← get list index (0-based)',
  'setup.formula.countVar':      'count',
  'setup.formula.step4.label':   '④ Map to winner',
  'setup.formula.indexVar':      'index',

  // ── WaitingView ───────────────────────────────────────────────────────────
  'waiting.title':         'Waiting for Block',
  'waiting.subtitle':      '"{{title}}" — Waiting for block #{{block}} to be mined',
  'waiting.countdown':     'Draw Countdown',
  'waiting.blocksLeft':    'Blocks Left',
  'waiting.estimatedTime': 'Est. Time',
  'waiting.locked':        'Locked #{{block}}',
  'waiting.target':        'Target #{{block}}',
  'waiting.latestBlock':   'Latest Block',
  'waiting.updatedAt':     'Updated at {{time}}',
  'waiting.waiting':       'Waiting...',
  'waiting.websocket':     'WebSocket Real-time Update',
  'waiting.lockedList':    'Locked List',
  'waiting.people':        '{{count}} people',

  'waiting.formula.title':          '📐 Draw Calculation Formula',
  'waiting.formula.desc':           'After the block is mined, anyone can verify with the following steps:',
  'waiting.formula.step1.label':    '① Get hash',
  'waiting.formula.step1.desc':     '→ Look up the Block Hash for block #{{block}} on mempool.space',
  'waiting.formula.step2.label':    '② Convert to number',
  'waiting.formula.step3.label':    '③ Get remainder',
  'waiting.formula.step3.suffix':   '← get index 0 to {{max}}',
  'waiting.formula.step4.label':    '④ Map to winner',
  'waiting.formula.step4.suffix':   '← index 0 is the 1st entry in the list',
  'waiting.formula.indexVar':       'index',

  // ── ResultView ────────────────────────────────────────────────────────────
  'result.mined':   'Block Mined!',
  'result.decided': 'The Bitcoin network has decided the winner',
  'result.winner':  'Winner',
  'result.from':    'From {{count}} participants, decided by Bitcoin block #{{block}}',

  'result.proof.title':       '🔍 Verifiable Calculation Process',
  'result.proof.drawBlock':   'Draw Block',
  'result.proof.blockHash':   'Block Hash',
  'result.proof.calcProcess': 'Calculation Process',
  'result.allParticipants':   'All Participants (in draw order)',

  'result.verifier.title':       '🧮 Self-Verification Tool',
  'result.verifier.desc':
    'Anyone can paste the block hash and participant list here to independently verify the result. No trust required.',
  'result.verifier.hashLabel':   'Block Hash (from mempool.space)',
  'result.verifier.listLabel':   'List (one per line, must be in original order)',
  'result.verifier.run':         '▶ Run Verification',
  'result.verifier.calcSteps':   'Calculation Steps',
  'result.verifier.match':       '✅ Verification matches this raffle exactly! Winner: {{winner}}',
  'result.verifier.invalidHash': '❌ Invalid hash format. Bitcoin block hash must be 64 hexadecimal characters.',
  'result.verifier.tooFew':      '❌ Please enter at least 2 names.',
  'result.verifier.mismatch':    '❌ Result mismatch! List order may be wrong. Calculated: {{calc}}, recorded: {{actual}}',
  'result.verifier.diffHash':    '⚠️ This hash differs from the draw block, but calculation is correct. Winner: {{winner}}',
  'result.verifier.done':        'Calculation complete. Winner: {{winner}} (index {{index}})',

  'result.copy':     '📋 Copy Verification Info',
  'result.verify':   '🔗 Verify on mempool.space',
  'result.newRaffle': '₿ New Raffle',

  // ── Calc steps (code block comments) ─────────────────────────────────────
  'calc.step1Comment': '1. Get block hash (hexadecimal)',
  'calc.step2Comment': '2. Convert to BigInt',
  'calc.step3Comment': '3. Modulo (remainder divided by participant count)',
  'calc.step4Comment': '4. Determine winner (0-indexed)',
  'calc.winner':       'winner',
  'calc.index':        'index',

  // ── Copy text ─────────────────────────────────────────────────────────────
  'copy.header':           '[BTC Raffle — Verified Result]',
  'copy.raffleName':       'Raffle Name:',
  'copy.drawBlock':        'Draw Block:',
  'copy.blockHash':        'Block Hash:',
  'copy.participantCount': 'Participant Count:',
  'copy.winner':           'Winner: {{winner}} (index {{index}}, 0-based)',
  'copy.verifyMethod':     'How to Verify:',
  'copy.verifyStep1':      '1. Go to {{url}} to confirm the block',
  'copy.verifyStep2':      '2. Run: BigInt("0x" + blockHash) % {{count}}n',
  'copy.verifyStep3':      '3. Result is {{index}}, which maps to index {{index}}: {{winner}}',
  'copy.participantList':  'Participants (in order):',

  // ── Toast ─────────────────────────────────────────────────────────────────
  'toast.alreadyInList': '"{{name}}" is already in the list',
  'toast.added':         'Added {{count}} people',
  'toast.blockMined':    'Target block is already mined, please reselect',
  'toast.noConnection':  'Cannot connect to the Bitcoin network',
  'toast.copied':        '✅ Verification info copied',
}
