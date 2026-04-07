import { createContext, useContext } from 'react'

export type Language = 'en' | 'pt-BR' | 'es'

export interface Translations {
  // ── UI strings ──────────────────────────────────────────────────────────────
  appTitle: string
  loading: (digest: string) => string
  loadingWait: string
  errorHint: string
  errorTipsTitle: string
  tipWait: string
  tipNetwork: string
  tipCheck: string
  // Input
  inputPlaceholder: string
  inputEmptyError: string
  inputUrlError: string
  inputHostError: string
  inputNotTxError: string
  // Display
  netResult: string
  gasFee: string
  stepByStep: string
  followUpPrompt: string
  followUpPlaceholder: string
  footer: string
  txLink: (short: string) => string
  stepsCount: (n: number) => string
  // WalletCard texts
  cardObjectsCreated: (n: number) => string
  cardNftsReceived: (n: number) => string
  cardSends: string
  cardReceives: string
  cardTxFailed: string
  // ── Narrative templates ─────────────────────────────────────────────────────
  narrativeFailed: (sender: string) => string
  narrativeFailedOutcome: string
  narrativeArbitrage: (sender: string, count: number, profit: string) => string
  narrativeArbitrageStepBorrow: (amount: string, sym: string) => string
  narrativeArbitrageStepSwap: (i: number, dex: string, typeText: string) => string
  narrativeArbitrageStepRepay: (profit: string) => string
  narrativeFlashLoan: (sender: string, protocol: string) => string
  narrativeSwap: (sender: string, desc: string, dex: string) => string
  narrativeSwapStep: (i: number, dex: string) => string
  narrativeCoinTransfer: (sender: string, amount: string, to: string) => string
  narrativeNftMint1: (sender: string, name: string) => string
  narrativeNftMintN: (sender: string, count: number, collection: string) => string
  narrativeNftMintOutcome: (count: number) => string
  narrativeNftTransfer1: (sender: string, name: string, to: string) => string
  narrativeNftTransferN: (sender: string, count: number, to: string) => string
  narrativeNftTransferOutcome: (count: number) => string
  narrativeAddLiquidity: (sender: string, protocol: string) => string
  narrativeRemoveLiquidity: (sender: string, protocol: string) => string
  narrativeStake: (sender: string, amount: string) => string
  narrativeUnstake: (sender: string) => string
  narrativeGovernance: (sender: string) => string
  narrativeGovernanceOutcome: string
  narrativeBridge: (sender: string, amount: string) => string
  narrativeContractCall1: (sender: string, fn: string, typeText: string, protocol: string) => string
  narrativeContractCallN: (sender: string, count: number, protocols: string) => string
  narrativeContractCallStep: (fn: string, types: string, mod: string) => string
  narrativeObjectCreation: (sender: string, count: number) => string
  narrativeObjectCreationOutcome: (count: number) => string
  narrativeUnknown: (sender: string) => string
  // ── Role labels ────────────────────────────────────────────────────────────
  roleSender: string
  roleRecipient: string
  roleProtocol: string
  roleContract: string
  // ── Contract trust badge ────────────────────────────────────────────────────
  contractVerifiedLabel: string
  contractVerifiedTitle: string
  contractVerifiedDesc: string
  contractUnverifiedLabel: string
  contractUnverifiedTitle: string
  contractUnverifiedDesc: string
  // ── Confidence indicator ────────────────────────────────────────────────────
  confidenceQualityTitle: string
  confidenceHigh: string
  confidenceHighDesc: string
  confidencePartial: string
  confidencePartialDesc: string
  confidenceComplex: string
  confidenceComplexDesc: string
  // ── Timestamp ───────────────────────────────────────────────────────────────
  tsJustNow: string
  tsMinAgo: (n: number) => string
  tsHoursAgo: (n: number) => string
  tsDaysAgo: (n: number) => string
  // ── Explain another ─────────────────────────────────────────────────────────
  explainAnother: string
  // ── Headline templates ──────────────────────────────────────────────────────
  headlineArbitrage: string
  headlineFlashLoan: string
  headlineSwap: string
  headlineMultiSwap: string
  headlineCoinTransfer: string
  headlineNftMint: string
  headlineNftTransfer: string
  headlineAddLiquidity: string
  headlineRemoveLiquidity: string
  headlineStake: string
  headlineUnstake: string
  headlineGovernance: string
  headlineBridge: string
  headlineObjectCreation: string
  headlineUnknown: string
  headlineFailed: string
  // ── Steps breakdown tabs ────────────────────────────────────────────────────
  tabFunctionsCalled: string
  tabAddressesInvolved: string
  tabObjectsCreated: (n: number) => string
  tabEventsEmitted: (n: number) => string
  tabGasDetails: string
  gasLabelTotalCost: string
  gasLabelComputation: string
  gasLabelFeeLamports: string
  gasLabelPaidBy: string
  // ── Gas explainer ───────────────────────────────────────────────────────────
  gasExplainerSui: string
  gasExplainerSolana: string
  // ── Docs panel ──────────────────────────────────────────────────────────────
  docsTitle: string
  docsSubtitle: string
  docsAboutTitle: string
  docsAboutP1: string
  docsAboutP2: string
  docsAboutReadOnly: string
  docsQualityTitle: string
  docsQualitySubtitle: string
  docsHighLabel: string
  docsHighDesc: string
  docsPartialLabel: string
  docsPartialDesc: string
  docsComplexLabel: string
  docsComplexDesc: string
  docsContractTitle: string
  docsContractSubtitle: string
  docsVerifiedLabel: string
  docsVerifiedDesc: string
  docsUnverifiedLabel: string
  docsUnverifiedDesc: string
  docsContractDisclaimer: string
  docsSolanaTitle: string
  docsSolanaP1: string
  docsSolanaP2: string
  docsFooter: string
  docsBack: string
  // ── Trusted protocols section ────────────────────────────────────────────────
  docsTrustedTitle: string
  docsTrustedSubtitle: string
  docsTrustedNote: string
  // ── Chain concepts section ───────────────────────────────────────────────────
  docsConceptsTitle: string
  cSuiPackageTerm: string
  cSuiPackageDesc: string
  cSuiDigestTerm: string
  cSuiDigestDesc: string
  cSuiObjectTerm: string
  cSuiObjectDesc: string
  cSuiGasTerm: string
  cSuiGasDesc: string
  cSolProgramTerm: string
  cSolProgramDesc: string
  cSolSignatureTerm: string
  cSolSignatureDesc: string
  cSolAccountTerm: string
  cSolAccountDesc: string
  cSolLamportTerm: string
  cSolLamportDesc: string
  cSolInstructionTerm: string
  cSolInstructionDesc: string
}

const en: Translations = {
  appTitle: 'Transaction Explainer',
  loading: (digest) => `I'm fetching data from ${digest}.`,
  loadingWait: 'This may take up to 30 seconds, please wait',
  errorHint: 'Make sure the transaction ID is valid. Supports Sui and Solana mainnet.',
  errorTipsTitle: 'Tips:',
  tipWait: 'Wait a few seconds and try again',
  tipNetwork: 'The network might be experiencing high load',
  tipCheck: 'Check if the transaction ID is correct',
  inputPlaceholder: 'Paste a Sui or Solana transaction hash, or a full explorer URL',
  inputEmptyError: 'Please paste a transaction ID or a supported explorer URL.',
  inputUrlError: 'That link is not a valid URL.',
  inputHostError: 'Supported explorers: SuiScan, SuiVision, Sui Explorer, Solscan, and Solana Explorer.',
  inputNotTxError: 'This URL does not look like a transaction page. Paste a transaction link or ID.',
  netResult: 'Net result:',
  gasFee: 'Gas fee:',
  stepByStep: 'Step by step',
  followUpPrompt: 'What do you want to better understand next?',
  followUpPlaceholder: 'Ask about called functions, objects created, timestamp or more...',
  footer: '©2026 Kmino. All rights reserved',
  txLink: (short) => `tx: ${short} ↗`,
  stepsCount: (n) => `${n} steps`,
  cardObjectsCreated: (n) => `created ${n} object${n !== 1 ? 's' : ''} ↗`,
  cardNftsReceived: (n) => `received ${n} NFT${n !== 1 ? 's' : ''} ↗`,
  cardSends: 'sends',
  cardReceives: 'receives',
  cardTxFailed: 'transaction failed',
  // Narratives
  narrativeFailed: (s) => `{{${s}}} attempted a transaction that did not succeed. No assets were moved.`,
  narrativeFailedOutcome: 'No changes — transaction reverted',
  narrativeArbitrage: (s, n, profit) =>
    `{{${s}}} borrowed tokens for free using a flash loan, instantly swapped through ${n} exchange${n !== 1 ? 's' : ''}, and repaid the loan in the same transaction — keeping a profit of ${profit}.`,
  narrativeArbitrageStepBorrow: (amount, sym) =>
    `Borrowed ${amount} ${sym} via flash loan — no upfront cost required`,
  narrativeArbitrageStepSwap: (i, dex, typeText) =>
    `Swap ${i + 1}: exchanged tokens on ${dex}${typeText}`,
  narrativeArbitrageStepRepay: (profit) =>
    `Repaid the flash loan in full and kept ${profit} as profit`,
  narrativeFlashLoan: (s, protocol) =>
    `{{${s}}} took out a flash loan from ${protocol} and repaid it within the same transaction.`,
  narrativeSwap: (s, desc, dex) =>
    `{{${s}}} swapped ${desc}${dex}.`,
  narrativeSwapStep: (i, dex) =>
    `Step ${i + 1}: swapped tokens on ${dex}`,
  narrativeCoinTransfer: (s, amount, to) =>
    `{{${s}}} sent ${amount}${to ? ` to {{${to}}}` : ''}.`,
  narrativeNftMint1: (s, name) =>
    `{{${s}}} minted "${name}".`,
  narrativeNftMintN: (s, n, col) =>
    `{{${s}}} minted ${n} NFTs from the ${col} collection.`,
  narrativeNftMintOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} minted`,
  narrativeNftTransfer1: (s, name, to) =>
    `{{${s}}} transferred "${name}"${to ? ` to {{${to}}}` : ''}.`,
  narrativeNftTransferN: (s, n, to) =>
    `{{${s}}} transferred ${n} NFTs${to ? ` to {{${to}}}` : ''}.`,
  narrativeNftTransferOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} transferred`,
  narrativeAddLiquidity: (s, protocol) =>
    `{{${s}}} added liquidity to ${protocol}.`,
  narrativeRemoveLiquidity: (s, protocol) =>
    `{{${s}}} removed liquidity from ${protocol}.`,
  narrativeStake: (s, amount) =>
    `{{${s}}} staked ${amount} to earn staking rewards on Sui.`,
  narrativeUnstake: (s) =>
    `{{${s}}} unstaked tokens and received them back into their wallet.`,
  narrativeGovernance: (s) =>
    `{{${s}}} participated in on-chain governance by casting a vote on a proposal.`,
  narrativeGovernanceOutcome: 'Vote recorded on-chain',
  narrativeBridge: (s, amount) =>
    `{{${s}}} bridged ${amount} to another blockchain.`,
  narrativeContractCall1: (s, fn, typeText, protocol) =>
    `{{${s}}} called "${fn}"${typeText} on ${protocol}.`,
  narrativeContractCallN: (s, n, protocols) =>
    `{{${s}}} executed ${n} contract calls across ${protocols}.`,
  narrativeContractCallStep: (fn, types, mod) =>
    `Called "${fn}${types}" on ${mod}`,
  narrativeObjectCreation: (s, n) =>
    `{{${s}}} created ${n} new object${n !== 1 ? 's' : ''} on Sui.`,
  narrativeObjectCreationOutcome: (n) => `${n} object${n !== 1 ? 's' : ''} created`,
  narrativeUnknown: (s) =>
    `{{${s}}} executed a transaction on-chain.`,
  // Role labels
  roleSender: 'Sender',
  roleRecipient: 'Recipient',
  roleProtocol: 'Protocol',
  roleContract: 'Contract',
  // Contract trust badge
  contractVerifiedLabel: 'Verified',
  contractVerifiedTitle: 'Recognized protocol',
  contractVerifiedDesc: 'This contract matches a known DeFi protocol.',
  contractUnverifiedLabel: 'Unverified',
  contractUnverifiedTitle: 'Unverified contract',
  contractUnverifiedDesc: "This contract isn't in our list of known protocols. Double-check the address before trusting it.",
  // Confidence
  confidenceQualityTitle: 'Interpretation quality',
  confidenceHigh: 'High confidence',
  confidenceHighDesc: 'All steps identified from on-chain events.',
  confidencePartial: 'Partial interpretation',
  confidencePartialDesc: 'Most steps identified. Some details may be simplified.',
  confidenceComplex: 'Complex transaction',
  confidenceComplexDesc: 'Some steps could not be fully interpreted.',
  // Timestamps
  tsJustNow: 'just now',
  tsMinAgo: (n) => `${n} min ago`,
  tsHoursAgo: (n) => `${n}h ago`,
  tsDaysAgo: (n) => `${n}d ago`,
  // Explain another
  explainAnother: 'Explain another transaction',
  // Headlines
  headlineArbitrage: 'Flash Loan Arbitrage',
  headlineFlashLoan: 'Flash Loan',
  headlineSwap: 'Token Swap',
  headlineMultiSwap: 'Multi-hop Token Swap',
  headlineCoinTransfer: 'Token Transfer',
  headlineNftMint: 'NFT Mint',
  headlineNftTransfer: 'NFT Transfer',
  headlineAddLiquidity: 'Add Liquidity',
  headlineRemoveLiquidity: 'Remove Liquidity',
  headlineStake: 'Stake SUI',
  headlineUnstake: 'Unstake SUI',
  headlineGovernance: 'Governance Vote',
  headlineBridge: 'Cross-Chain Bridge',
  headlineObjectCreation: 'Object Creation',
  headlineUnknown: 'Transaction',
  headlineFailed: 'Failed Transaction',
  // Steps breakdown tabs
  tabFunctionsCalled: 'Functions called',
  tabAddressesInvolved: 'Addresses involved',
  tabObjectsCreated: (n) => `Objects created (${n})`,
  tabEventsEmitted: (n) => `Events emitted (${n})`,
  tabGasDetails: 'Gas details',
  gasLabelTotalCost: 'Total cost',
  gasLabelComputation: 'Computation',
  gasLabelFeeLamports: 'Fee (lamports)',
  gasLabelPaidBy: 'Paid by',
  // Gas explainer
  gasExplainerSui: 'Gas on Sui covers computation and storage. Unused storage deposits are refunded.',
  gasExplainerSolana: 'Transaction fee is paid in SOL and burned. No storage deposit — no refund.',
  // Docs panel
  docsTitle: 'Documentation',
  docsSubtitle: 'How the explainer works',
  docsAboutTitle: 'About',
  docsAboutP1: 'Suilana Explainer reads raw on-chain data from Sui and Solana mainnet and translates it into plain language — no blockchain knowledge required.',
  docsAboutP2: 'Paste any transaction hash or a full explorer URL from SuiScan, SuiVision, Sui Explorer, Solscan, or Solana Explorer. The tool fetches the transaction, classifies what happened, and generates a step-by-step explanation backed entirely by on-chain events.',
  docsAboutReadOnly: 'No signup. No wallet connection. Read-only.',
  docsQualityTitle: 'Interpretation quality',
  docsQualitySubtitle: 'Every result shows how completely the explanation was reconstructed from on-chain events.',
  docsHighLabel: 'High confidence',
  docsHighDesc: 'All steps were identified from on-chain events. The explanation is a direct read of what happened.',
  docsPartialLabel: 'Partial interpretation',
  docsPartialDesc: 'Most steps are identified. Some details (token amounts, protocol names) may be simplified or inferred.',
  docsComplexLabel: 'Complex transaction',
  docsComplexDesc: "The transaction involves patterns the tool couldn't fully decode. The explanation covers what was visible.",
  docsContractTitle: 'Contract verification',
  docsContractSubtitle: 'On Sui transactions, the receiver card shows a trust badge when interacting with a smart contract.',
  docsVerifiedLabel: 'Verified',
  docsVerifiedDesc: "The contract's module name matches a known Sui DeFi protocol — Cetus, DeepBook, Turbos, Kriya, Aftermath, and others.",
  docsUnverifiedLabel: 'Unverified',
  docsUnverifiedDesc: "Not in the known-protocol list. It may be legitimate but isn't recognized. Always verify the package address on SuiScan before trusting it with funds.",
  docsContractDisclaimer: 'Verification is name-based — not a security audit. A verified badge means the module matches a known name pattern, not that the contract is bug-free or safe.',
  docsSolanaTitle: 'Solana transactions',
  docsSolanaP1: 'Solana transactions are identified by a base-58 signature (87–88 characters). Paste it directly or use a Solscan or Solana Explorer URL.',
  docsSolanaP2: 'Gas on Solana is a fixed fee in SOL that is burned — there is no storage deposit or refund. Net results show only your wallet\'s SOL and SPL token balance changes.',
  docsFooter: '©2026 Kmino · Data from Sui and Solana mainnet public RPC',
  docsBack: 'Back',
  docsTrustedTitle: 'Trusted protocols',
  docsTrustedSubtitle: 'These protocols are recognized by name and shown as Verified in the app. Verification is name-based — not a security audit.',
  docsTrustedNote: 'All other contracts show as Unverified. This does not mean they are unsafe — always verify the package or program address yourself before interacting.',
  docsConceptsTitle: 'Chain concepts',
  cSuiPackageTerm: 'Package',
  cSuiPackageDesc: 'A deployed smart contract on Sui. Packages contain modules (libraries of functions). When the app shows a contract call, it shows the package address and module name.',
  cSuiDigestTerm: 'Transaction Digest',
  cSuiDigestDesc: 'A unique identifier for a Sui transaction — a 44-character base-58 string. This is what you paste to look up a transaction.',
  cSuiObjectTerm: 'Object',
  cSuiObjectDesc: "Sui's primary data primitive. Everything on Sui — tokens, NFTs, liquidity positions, receipts — is an object with a unique ID and an owner.",
  cSuiGasTerm: 'Gas & Storage',
  cSuiGasDesc: 'Sui charges gas for computation and a refundable storage deposit for new objects. When objects are deleted, the deposit is returned to the sender.',
  cSolProgramTerm: 'Program',
  cSolProgramDesc: "Solana's term for a smart contract. Programs are stateless and identified by their address (e.g. Jupiter: JUP6Lb…). Equivalent to a Sui package.",
  cSolSignatureTerm: 'Signature',
  cSolSignatureDesc: 'The transaction identifier on Solana — an 87–88 character base-58 string. Equivalent to a Sui digest. This is what you paste to look up a transaction.',
  cSolAccountTerm: 'Account',
  cSolAccountDesc: 'Solana stores all state in accounts. Every wallet, token balance, and program data lives in an account. Token accounts are separate from wallet accounts.',
  cSolLamportTerm: 'Lamport',
  cSolLamportDesc: 'The smallest unit of SOL (1 SOL = 1,000,000,000 lamports). Transaction fees are paid in lamports and permanently burned — no refund.',
  cSolInstructionTerm: 'Instruction',
  cSolInstructionDesc: 'A single operation within a Solana transaction. One transaction can contain multiple instructions calling different programs in sequence.',
}

const ptBR: Translations = {
  appTitle: 'Explicador de Transações',
  loading: (digest) => `Buscando dados de ${digest}.`,
  loadingWait: 'Isso pode levar até 30 segundos, por favor aguarde',
  errorHint: 'Verifique se o ID da transação é válido. Suporta Sui e Solana mainnet.',
  errorTipsTitle: 'Dicas:',
  tipWait: 'Aguarde alguns segundos e tente novamente',
  tipNetwork: 'A rede pode estar sobrecarregada',
  tipCheck: 'Confirme se o ID da transação está correto',
  inputPlaceholder: 'Cole um hash de transação Sui ou Solana, ou URL de explorador',
  inputEmptyError: 'Cole um ID de transação ou uma URL de explorador suportada.',
  inputUrlError: 'Este link não é uma URL válida.',
  inputHostError: 'Exploradores suportados: SuiScan, SuiVision, Sui Explorer, Solscan e Solana Explorer.',
  inputNotTxError: 'Esta URL não parece uma página de transação. Cole um link ou ID de transação.',
  netResult: 'Resultado líquido:',
  gasFee: 'Taxa de gás:',
  stepByStep: 'Passo a passo',
  followUpPrompt: 'O que você quer entender melhor?',
  followUpPlaceholder: 'Pergunte sobre funções chamadas, objetos criados, horário e mais...',
  footer: '©2026 Kmino. Todos os direitos reservados',
  txLink: (short) => `tx: ${short} ↗`,
  stepsCount: (n) => `${n} etapas`,
  cardObjectsCreated: (n) => `criou ${n} objeto${n !== 1 ? 's' : ''} ↗`,
  cardNftsReceived: (n) => `recebeu ${n} NFT${n !== 1 ? 's' : ''} ↗`,
  cardSends: 'envia',
  cardReceives: 'recebe',
  cardTxFailed: 'transação falhou',
  // Narratives
  narrativeFailed: (s) => `{{${s}}} tentou realizar uma transação que não foi concluída. Nenhum ativo foi movido.`,
  narrativeFailedOutcome: 'Sem alterações — transação revertida',
  narrativeArbitrage: (s, n, profit) =>
    `{{${s}}} emprestou tokens gratuitamente via flash loan, trocou instantaneamente em ${n} exchange${n !== 1 ? 's' : ''} e pagou o empréstimo na mesma transação — ficando com um lucro de ${profit}.`,
  narrativeArbitrageStepBorrow: (amount, sym) =>
    `Emprestou ${amount} ${sym} via flash loan — sem custo inicial`,
  narrativeArbitrageStepSwap: (i, dex, typeText) =>
    `Swap ${i + 1}: trocou tokens em ${dex}${typeText}`,
  narrativeArbitrageStepRepay: (profit) =>
    `Pagou o flash loan integralmente e ficou com ${profit} de lucro`,
  narrativeFlashLoan: (s, protocol) =>
    `{{${s}}} obteve um flash loan de ${protocol} e pagou na mesma transação.`,
  narrativeSwap: (s, desc, dex) =>
    `{{${s}}} trocou ${desc}${dex}.`,
  narrativeSwapStep: (i, dex) =>
    `Etapa ${i + 1}: trocou tokens em ${dex}`,
  narrativeCoinTransfer: (s, amount, to) =>
    `{{${s}}} enviou ${amount}${to ? ` para {{${to}}}` : ''}.`,
  narrativeNftMint1: (s, name) =>
    `{{${s}}} cunhou "${name}".`,
  narrativeNftMintN: (s, n, col) =>
    `{{${s}}} cunhou ${n} NFTs da coleção ${col}.`,
  narrativeNftMintOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} cunhado${n !== 1 ? 's' : ''}`,
  narrativeNftTransfer1: (s, name, to) =>
    `{{${s}}} transferiu "${name}"${to ? ` para {{${to}}}` : ''}.`,
  narrativeNftTransferN: (s, n, to) =>
    `{{${s}}} transferiu ${n} NFTs${to ? ` para {{${to}}}` : ''}.`,
  narrativeNftTransferOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} transferido${n !== 1 ? 's' : ''}`,
  narrativeAddLiquidity: (s, protocol) =>
    `{{${s}}} adicionou liquidez em ${protocol}.`,
  narrativeRemoveLiquidity: (s, protocol) =>
    `{{${s}}} removeu liquidez de ${protocol}.`,
  narrativeStake: (s, amount) =>
    `{{${s}}} fez staking de ${amount} para ganhar recompensas na rede Sui.`,
  narrativeUnstake: (s) =>
    `{{${s}}} retirou os tokens do staking e os recebeu de volta na carteira.`,
  narrativeGovernance: (s) =>
    `{{${s}}} participou da governança on-chain votando em uma proposta.`,
  narrativeGovernanceOutcome: 'Voto registrado na blockchain',
  narrativeBridge: (s, amount) =>
    `{{${s}}} transferiu ${amount} para outra blockchain.`,
  narrativeContractCall1: (s, fn, typeText, protocol) =>
    `{{${s}}} chamou "${fn}"${typeText} em ${protocol}.`,
  narrativeContractCallN: (s, n, protocols) =>
    `{{${s}}} executou ${n} chamadas de contrato em ${protocols}.`,
  narrativeContractCallStep: (fn, types, mod) =>
    `Chamou "${fn}${types}" em ${mod}`,
  narrativeObjectCreation: (s, n) =>
    `{{${s}}} criou ${n} novo${n !== 1 ? 's' : ''} objeto${n !== 1 ? 's' : ''} na Sui.`,
  narrativeObjectCreationOutcome: (n) => `${n} objeto${n !== 1 ? 's' : ''} criado${n !== 1 ? 's' : ''}`,
  narrativeUnknown: (s) =>
    `{{${s}}} executou uma transação on-chain.`,
  // Role labels
  roleSender: 'Remetente',
  roleRecipient: 'Destinatário',
  roleProtocol: 'Protocolo',
  roleContract: 'Contrato',
  // Contract trust badge
  contractVerifiedLabel: 'Verificado',
  contractVerifiedTitle: 'Protocolo reconhecido',
  contractVerifiedDesc: 'Este contrato corresponde a um protocolo DeFi conhecido.',
  contractUnverifiedLabel: 'Não verificado',
  contractUnverifiedTitle: 'Contrato não verificado',
  contractUnverifiedDesc: 'Este contrato não está na nossa lista de protocolos conhecidos. Verifique o endereço antes de confiar nele.',
  // Confidence
  confidenceQualityTitle: 'Qualidade da interpretação',
  confidenceHigh: 'Alta confiança',
  confidenceHighDesc: 'Todas as etapas identificadas por eventos on-chain.',
  confidencePartial: 'Interpretação parcial',
  confidencePartialDesc: 'A maioria das etapas foi identificada. Alguns detalhes podem estar simplificados.',
  confidenceComplex: 'Transação complexa',
  confidenceComplexDesc: 'Algumas etapas não puderam ser completamente interpretadas.',
  // Timestamps
  tsJustNow: 'agora mesmo',
  tsMinAgo: (n) => `há ${n} min`,
  tsHoursAgo: (n) => `há ${n}h`,
  tsDaysAgo: (n) => `há ${n}d`,
  // Explain another
  explainAnother: 'Explicar outra transação',
  // Headlines
  headlineArbitrage: 'Arbitragem com Flash Loan',
  headlineFlashLoan: 'Flash Loan',
  headlineSwap: 'Troca de Tokens',
  headlineMultiSwap: 'Troca Multi-etapa',
  headlineCoinTransfer: 'Transferência de Tokens',
  headlineNftMint: 'Cunhagem de NFT',
  headlineNftTransfer: 'Transferência de NFT',
  headlineAddLiquidity: 'Adicionar Liquidez',
  headlineRemoveLiquidity: 'Remover Liquidez',
  headlineStake: 'Staking de SUI',
  headlineUnstake: 'Retirada de Staking',
  headlineGovernance: 'Votação de Governança',
  headlineBridge: 'Bridge entre Chains',
  headlineObjectCreation: 'Criação de Objeto',
  headlineUnknown: 'Transação',
  headlineFailed: 'Transação Falhou',
  // Steps breakdown tabs
  tabFunctionsCalled: 'Funções chamadas',
  tabAddressesInvolved: 'Endereços envolvidos',
  tabObjectsCreated: (n) => `Objetos criados (${n})`,
  tabEventsEmitted: (n) => `Eventos emitidos (${n})`,
  tabGasDetails: 'Detalhes do gás',
  gasLabelTotalCost: 'Custo total',
  gasLabelComputation: 'Computação',
  gasLabelFeeLamports: 'Taxa (lamports)',
  gasLabelPaidBy: 'Pago por',
  // Gas explainer
  gasExplainerSui: 'O gás na Sui cobre computação e armazenamento. Depósitos de armazenamento não utilizados são reembolsados.',
  gasExplainerSolana: 'A taxa de transação é paga em SOL e queimada. Sem depósito de armazenamento — sem reembolso.',
  // Docs panel
  docsTitle: 'Documentação',
  docsSubtitle: 'Como o explicador funciona',
  docsAboutTitle: 'Sobre',
  docsAboutP1: 'O Suilana Explainer lê dados brutos da blockchain Sui e Solana e os traduz para linguagem simples — sem necessidade de conhecimento em blockchain.',
  docsAboutP2: 'Cole qualquer hash de transação ou URL completa de SuiScan, SuiVision, Sui Explorer, Solscan ou Solana Explorer. A ferramenta busca a transação, classifica o que aconteceu e gera uma explicação passo a passo baseada inteiramente em eventos on-chain.',
  docsAboutReadOnly: 'Sem cadastro. Sem conexão de carteira. Somente leitura.',
  docsQualityTitle: 'Qualidade da interpretação',
  docsQualitySubtitle: 'Cada resultado mostra o quão completamente a explicação foi reconstruída a partir de eventos on-chain.',
  docsHighLabel: 'Alta confiança',
  docsHighDesc: 'Todas as etapas foram identificadas por eventos on-chain. A explicação é uma leitura direta do que aconteceu.',
  docsPartialLabel: 'Interpretação parcial',
  docsPartialDesc: 'A maioria das etapas foi identificada. Alguns detalhes (valores, nomes de protocolos) podem estar simplificados ou inferidos.',
  docsComplexLabel: 'Transação complexa',
  docsComplexDesc: 'A transação envolve padrões que a ferramenta não conseguiu decodificar completamente. A explicação cobre o que foi visível.',
  docsContractTitle: 'Verificação de contrato',
  docsContractSubtitle: 'Em transações Sui, o cartão do destinatário exibe um selo de confiança ao interagir com um contrato inteligente.',
  docsVerifiedLabel: 'Verificado',
  docsVerifiedDesc: 'O nome do módulo do contrato corresponde a um protocolo DeFi Sui conhecido — Cetus, DeepBook, Turbos, Kriya, Aftermath, entre outros.',
  docsUnverifiedLabel: 'Não verificado',
  docsUnverifiedDesc: 'Não está na lista de protocolos conhecidos. Pode ser legítimo, mas não foi reconhecido. Verifique sempre o endereço do pacote no SuiScan antes de confiar com seus fundos.',
  docsContractDisclaimer: 'A verificação é baseada no nome — não é uma auditoria de segurança. O selo verificado indica que o módulo corresponde a um padrão conhecido, não que o contrato seja livre de bugs ou seguro.',
  docsSolanaTitle: 'Transações Solana',
  docsSolanaP1: 'Transações Solana são identificadas por uma assinatura em base-58 (87–88 caracteres). Cole diretamente ou use uma URL do Solscan ou Solana Explorer.',
  docsSolanaP2: 'O gás na Solana é uma taxa fixa em SOL que é queimada — não há depósito de armazenamento ou reembolso. Os resultados líquidos mostram apenas as mudanças de saldo em SOL e tokens SPL da sua carteira.',
  docsFooter: '©2026 Kmino · Dados de RPC público da Sui e Solana mainnet',
  docsBack: 'Voltar',
  docsTrustedTitle: 'Protocolos confiáveis',
  docsTrustedSubtitle: 'Protocolos reconhecidos pelo nome e exibidos como Verificado no app. A verificação é baseada no nome — não é uma auditoria de segurança.',
  docsTrustedNote: 'Todos os outros contratos aparecem como Não verificado. Isso não significa que são inseguros — verifique sempre o endereço do pacote ou programa você mesmo antes de interagir.',
  docsConceptsTitle: 'Conceitos da blockchain',
  cSuiPackageTerm: 'Package (pacote)',
  cSuiPackageDesc: 'Um contrato inteligente implantado na Sui. Pacotes contêm módulos (bibliotecas de funções). Quando o app mostra uma chamada de contrato, exibe o endereço do pacote e o nome do módulo.',
  cSuiDigestTerm: 'Transaction Digest',
  cSuiDigestDesc: 'Um identificador único para uma transação Sui — uma string base-58 de 44 caracteres. É o que você cola para buscar uma transação.',
  cSuiObjectTerm: 'Objeto',
  cSuiObjectDesc: 'O primitivo de dados principal da Sui. Tudo na Sui — tokens, NFTs, posições de liquidez, recibos — é um objeto com ID único e um proprietário.',
  cSuiGasTerm: 'Gás e Armazenamento',
  cSuiGasDesc: 'A Sui cobra gás pela computação e um depósito de armazenamento reembolsável para novos objetos. Quando os objetos são deletados, o depósito é devolvido ao remetente.',
  cSolProgramTerm: 'Program (programa)',
  cSolProgramDesc: 'O termo da Solana para contrato inteligente. Programas são stateless e identificados pelo endereço (ex: Jupiter: JUP6Lb…). Equivalente a um package da Sui.',
  cSolSignatureTerm: 'Signature (assinatura)',
  cSolSignatureDesc: 'O identificador de transação na Solana — uma string base-58 de 87–88 caracteres. Equivalente ao digest da Sui. É o que você cola para buscar uma transação.',
  cSolAccountTerm: 'Account (conta)',
  cSolAccountDesc: 'A Solana armazena todo o estado em contas. Cada carteira, saldo de token e dado de programa é uma conta. Contas de token são separadas das contas de carteira.',
  cSolLamportTerm: 'Lamport',
  cSolLamportDesc: 'A menor unidade do SOL (1 SOL = 1.000.000.000 lamports). As taxas são pagas em lamports e queimadas permanentemente — sem reembolso.',
  cSolInstructionTerm: 'Instruction (instrução)',
  cSolInstructionDesc: 'Uma única operação dentro de uma transação Solana. Uma transação pode conter múltiplas instruções chamando diferentes programas em sequência.',
}

const es: Translations = {
  appTitle: 'Explicador de Transacciones',
  loading: (digest) => `Obteniendo datos de ${digest}.`,
  loadingWait: 'Esto puede tardar hasta 30 segundos, por favor espera',
  errorHint: 'Asegúrate de que el ID de transacción sea válido. Compatible con Sui y Solana mainnet.',
  errorTipsTitle: 'Consejos:',
  tipWait: 'Espera unos segundos e intenta de nuevo',
  tipNetwork: 'La red puede estar experimentando alta carga',
  tipCheck: 'Verifica que el ID de transacción sea correcto',
  inputPlaceholder: 'Pega un hash de transacción Sui o Solana, o una URL de explorador',
  inputEmptyError: 'Pega un ID de transacción o una URL de explorador compatible.',
  inputUrlError: 'Este enlace no es una URL válida.',
  inputHostError: 'Exploradores compatibles: SuiScan, SuiVision, Sui Explorer, Solscan y Solana Explorer.',
  inputNotTxError: 'Esta URL no parece una página de transacción. Pega un enlace o ID de transacción.',
  netResult: 'Resultado neto:',
  gasFee: 'Comisión de gas:',
  stepByStep: 'Paso a paso',
  followUpPrompt: '¿Qué quieres entender mejor?',
  followUpPlaceholder: 'Pregunta sobre funciones llamadas, objetos creados, fecha y más...',
  footer: '©2026 Kmino. Todos los derechos reservados',
  txLink: (short) => `tx: ${short} ↗`,
  stepsCount: (n) => `${n} pasos`,
  cardObjectsCreated: (n) => `creó ${n} objeto${n !== 1 ? 's' : ''} ↗`,
  cardNftsReceived: (n) => `recibió ${n} NFT${n !== 1 ? 's' : ''} ↗`,
  cardSends: 'envía',
  cardReceives: 'recibe',
  cardTxFailed: 'transacción fallida',
  // Narratives
  narrativeFailed: (s) => `{{${s}}} intentó una transacción que no tuvo éxito. No se movió ningún activo.`,
  narrativeFailedOutcome: 'Sin cambios — transacción revertida',
  narrativeArbitrage: (s, n, profit) =>
    `{{${s}}} tomó prestados tokens gratis con un flash loan, intercambió en ${n} exchange${n !== 1 ? 's' : ''} al instante y pagó el préstamo en la misma transacción — obteniendo una ganancia de ${profit}.`,
  narrativeArbitrageStepBorrow: (amount, sym) =>
    `Tomó prestados ${amount} ${sym} vía flash loan — sin costo inicial`,
  narrativeArbitrageStepSwap: (i, dex, typeText) =>
    `Swap ${i + 1}: intercambió tokens en ${dex}${typeText}`,
  narrativeArbitrageStepRepay: (profit) =>
    `Pagó el flash loan en su totalidad y conservó ${profit} como ganancia`,
  narrativeFlashLoan: (s, protocol) =>
    `{{${s}}} tomó un flash loan de ${protocol} y lo pagó en la misma transacción.`,
  narrativeSwap: (s, desc, dex) =>
    `{{${s}}} intercambió ${desc}${dex}.`,
  narrativeSwapStep: (i, dex) =>
    `Paso ${i + 1}: intercambió tokens en ${dex}`,
  narrativeCoinTransfer: (s, amount, to) =>
    `{{${s}}} envió ${amount}${to ? ` a {{${to}}}` : ''}.`,
  narrativeNftMint1: (s, name) =>
    `{{${s}}} acuñó "${name}".`,
  narrativeNftMintN: (s, n, col) =>
    `{{${s}}} acuñó ${n} NFTs de la colección ${col}.`,
  narrativeNftMintOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} acuñado${n !== 1 ? 's' : ''}`,
  narrativeNftTransfer1: (s, name, to) =>
    `{{${s}}} transfirió "${name}"${to ? ` a {{${to}}}` : ''}.`,
  narrativeNftTransferN: (s, n, to) =>
    `{{${s}}} transfirió ${n} NFTs${to ? ` a {{${to}}}` : ''}.`,
  narrativeNftTransferOutcome: (n) => `${n} NFT${n !== 1 ? 's' : ''} transferido${n !== 1 ? 's' : ''}`,
  narrativeAddLiquidity: (s, protocol) =>
    `{{${s}}} añadió liquidez en ${protocol}.`,
  narrativeRemoveLiquidity: (s, protocol) =>
    `{{${s}}} retiró liquidez de ${protocol}.`,
  narrativeStake: (s, amount) =>
    `{{${s}}} hizo staking de ${amount} para ganar recompensas en la red Sui.`,
  narrativeUnstake: (s) =>
    `{{${s}}} retiró los tokens del staking y los recibió de vuelta en su billetera.`,
  narrativeGovernance: (s) =>
    `{{${s}}} participó en la gobernanza on-chain votando en una propuesta.`,
  narrativeGovernanceOutcome: 'Voto registrado en la blockchain',
  narrativeBridge: (s, amount) =>
    `{{${s}}} transfirió ${amount} a otra blockchain.`,
  narrativeContractCall1: (s, fn, typeText, protocol) =>
    `{{${s}}} llamó a "${fn}"${typeText} en ${protocol}.`,
  narrativeContractCallN: (s, n, protocols) =>
    `{{${s}}} ejecutó ${n} llamadas de contrato en ${protocols}.`,
  narrativeContractCallStep: (fn, types, mod) =>
    `Llamó a "${fn}${types}" en ${mod}`,
  narrativeObjectCreation: (s, n) =>
    `{{${s}}} creó ${n} nuevo${n !== 1 ? 's' : ''} objeto${n !== 1 ? 's' : ''} en Sui.`,
  narrativeObjectCreationOutcome: (n) => `${n} objeto${n !== 1 ? 's' : ''} creado${n !== 1 ? 's' : ''}`,
  narrativeUnknown: (s) =>
    `{{${s}}} ejecutó una transacción on-chain.`,
  // Role labels
  roleSender: 'Remitente',
  roleRecipient: 'Destinatario',
  roleProtocol: 'Protocolo',
  roleContract: 'Contrato',
  // Contract trust badge
  contractVerifiedLabel: 'Verificado',
  contractVerifiedTitle: 'Protocolo reconocido',
  contractVerifiedDesc: 'Este contrato coincide con un protocolo DeFi conocido.',
  contractUnverifiedLabel: 'No verificado',
  contractUnverifiedTitle: 'Contrato no verificado',
  contractUnverifiedDesc: 'Este contrato no está en nuestra lista de protocolos conocidos. Verifica la dirección antes de confiar en él.',
  // Confidence
  confidenceQualityTitle: 'Calidad de interpretación',
  confidenceHigh: 'Alta confianza',
  confidenceHighDesc: 'Todos los pasos identificados desde eventos on-chain.',
  confidencePartial: 'Interpretación parcial',
  confidencePartialDesc: 'La mayoría de los pasos fueron identificados. Algunos detalles pueden estar simplificados.',
  confidenceComplex: 'Transacción compleja',
  confidenceComplexDesc: 'Algunos pasos no pudieron interpretarse por completo.',
  // Timestamps
  tsJustNow: 'ahora mismo',
  tsMinAgo: (n) => `hace ${n} min`,
  tsHoursAgo: (n) => `hace ${n}h`,
  tsDaysAgo: (n) => `hace ${n}d`,
  // Explain another
  explainAnother: 'Explicar otra transacción',
  // Headlines
  headlineArbitrage: 'Arbitraje con Flash Loan',
  headlineFlashLoan: 'Flash Loan',
  headlineSwap: 'Intercambio de Tokens',
  headlineMultiSwap: 'Intercambio Multi-salto',
  headlineCoinTransfer: 'Transferencia de Tokens',
  headlineNftMint: 'Acuñación de NFT',
  headlineNftTransfer: 'Transferencia de NFT',
  headlineAddLiquidity: 'Añadir Liquidez',
  headlineRemoveLiquidity: 'Retirar Liquidez',
  headlineStake: 'Staking de SUI',
  headlineUnstake: 'Retirar Staking',
  headlineGovernance: 'Votación de Gobernanza',
  headlineBridge: 'Puente entre Cadenas',
  headlineObjectCreation: 'Creación de Objeto',
  headlineUnknown: 'Transacción',
  headlineFailed: 'Transacción Fallida',
  // Steps breakdown tabs
  tabFunctionsCalled: 'Funciones llamadas',
  tabAddressesInvolved: 'Direcciones involucradas',
  tabObjectsCreated: (n) => `Objetos creados (${n})`,
  tabEventsEmitted: (n) => `Eventos emitidos (${n})`,
  tabGasDetails: 'Detalles del gas',
  gasLabelTotalCost: 'Costo total',
  gasLabelComputation: 'Cómputo',
  gasLabelFeeLamports: 'Comisión (lamports)',
  gasLabelPaidBy: 'Pagado por',
  // Gas explainer
  gasExplainerSui: 'El gas en Sui cubre cómputo y almacenamiento. Los depósitos de almacenamiento no utilizados son reembolsados.',
  gasExplainerSolana: 'La comisión de transacción se paga en SOL y se quema. Sin depósito de almacenamiento — sin reembolso.',
  // Docs panel
  docsTitle: 'Documentación',
  docsSubtitle: 'Cómo funciona el explicador',
  docsAboutTitle: 'Acerca de',
  docsAboutP1: 'Suilana Explainer lee datos brutos de la blockchain de Sui y Solana y los traduce a lenguaje sencillo — sin necesidad de conocimientos en blockchain.',
  docsAboutP2: 'Pega cualquier hash de transacción o URL completa de SuiScan, SuiVision, Sui Explorer, Solscan o Solana Explorer. La herramienta obtiene la transacción, clasifica lo que ocurrió y genera una explicación paso a paso respaldada por eventos on-chain.',
  docsAboutReadOnly: 'Sin registro. Sin conexión de billetera. Solo lectura.',
  docsQualityTitle: 'Calidad de interpretación',
  docsQualitySubtitle: 'Cada resultado muestra qué tan completamente se reconstruyó la explicación a partir de eventos on-chain.',
  docsHighLabel: 'Alta confianza',
  docsHighDesc: 'Todos los pasos fueron identificados desde eventos on-chain. La explicación es una lectura directa de lo que ocurrió.',
  docsPartialLabel: 'Interpretación parcial',
  docsPartialDesc: 'La mayoría de los pasos fueron identificados. Algunos detalles (montos, nombres de protocolos) pueden estar simplificados o inferidos.',
  docsComplexLabel: 'Transacción compleja',
  docsComplexDesc: 'La transacción involucra patrones que la herramienta no pudo decodificar completamente. La explicación cubre lo que fue visible.',
  docsContractTitle: 'Verificación de contrato',
  docsContractSubtitle: 'En transacciones Sui, la tarjeta del destinatario muestra una insignia de confianza al interactuar con un contrato inteligente.',
  docsVerifiedLabel: 'Verificado',
  docsVerifiedDesc: 'El nombre del módulo del contrato coincide con un protocolo DeFi de Sui conocido — Cetus, DeepBook, Turbos, Kriya, Aftermath, entre otros.',
  docsUnverifiedLabel: 'No verificado',
  docsUnverifiedDesc: 'No está en la lista de protocolos conocidos. Puede ser legítimo pero no está reconocido. Verifica siempre la dirección del paquete en SuiScan antes de confiar en él con fondos.',
  docsContractDisclaimer: 'La verificación es por nombre — no es una auditoría de seguridad. La insignia verificada indica que el módulo coincide con un patrón conocido, no que el contrato esté libre de errores o sea seguro.',
  docsSolanaTitle: 'Transacciones de Solana',
  docsSolanaP1: 'Las transacciones de Solana se identifican por una firma en base-58 (87–88 caracteres). Pégala directamente o usa una URL de Solscan o Solana Explorer.',
  docsSolanaP2: 'El gas en Solana es una comisión fija en SOL que se quema — no hay depósito de almacenamiento ni reembolso. Los resultados netos muestran solo los cambios de saldo en SOL y tokens SPL de tu billetera.',
  docsFooter: '©2026 Kmino · Datos de RPC público de Sui y Solana mainnet',
  docsBack: 'Volver',
  docsTrustedTitle: 'Protocolos de confianza',
  docsTrustedSubtitle: 'Protocolos reconocidos por nombre y mostrados como Verificado en la app. La verificación es por nombre — no es una auditoría de seguridad.',
  docsTrustedNote: 'Todos los demás contratos aparecen como No verificado. Eso no significa que sean inseguros — verifica siempre la dirección del paquete o programa antes de interactuar.',
  docsConceptsTitle: 'Conceptos de blockchain',
  cSuiPackageTerm: 'Package (paquete)',
  cSuiPackageDesc: 'Un contrato inteligente desplegado en Sui. Los paquetes contienen módulos (bibliotecas de funciones). Cuando la app muestra una llamada de contrato, muestra la dirección del paquete y el nombre del módulo.',
  cSuiDigestTerm: 'Transaction Digest',
  cSuiDigestDesc: 'Un identificador único para una transacción de Sui — una cadena base-58 de 44 caracteres. Es lo que pegas para buscar una transacción.',
  cSuiObjectTerm: 'Objeto',
  cSuiObjectDesc: 'El primitivo de datos principal de Sui. Todo en Sui — tokens, NFTs, posiciones de liquidez, recibos — es un objeto con un ID único y un propietario.',
  cSuiGasTerm: 'Gas y Almacenamiento',
  cSuiGasDesc: 'Sui cobra gas por cómputo y un depósito de almacenamiento reembolsable para nuevos objetos. Cuando los objetos se eliminan, el depósito se devuelve al remitente.',
  cSolProgramTerm: 'Program (programa)',
  cSolProgramDesc: 'El término de Solana para contrato inteligente. Los programas son stateless y se identifican por su dirección (p.ej. Jupiter: JUP6Lb…). Equivalente a un package de Sui.',
  cSolSignatureTerm: 'Signature (firma)',
  cSolSignatureDesc: 'El identificador de transacción en Solana — una cadena base-58 de 87–88 caracteres. Equivalente al digest de Sui. Es lo que pegas para buscar una transacción.',
  cSolAccountTerm: 'Account (cuenta)',
  cSolAccountDesc: 'Solana almacena todo el estado en cuentas. Cada billetera, saldo de token y dato de programa es una cuenta. Las cuentas de token son independientes de las cuentas de billetera.',
  cSolLamportTerm: 'Lamport',
  cSolLamportDesc: 'La unidad mínima de SOL (1 SOL = 1.000.000.000 lamports). Las comisiones se pagan en lamports y se queman permanentemente — sin reembolso.',
  cSolInstructionTerm: 'Instruction (instrucción)',
  cSolInstructionDesc: 'Una única operación dentro de una transacción de Solana. Una transacción puede contener múltiples instrucciones que llaman a diferentes programas en secuencia.',
}

export const allTranslations: Record<Language, Translations> = { en, 'pt-BR': ptBR, es }

// ── React context ──────────────────────────────────────────────────────────────

export interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: en,
})

export function useT(): LanguageContextValue {
  return useContext(LanguageContext)
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  'pt-BR': 'Português (BR)',
  es: 'Español',
}
