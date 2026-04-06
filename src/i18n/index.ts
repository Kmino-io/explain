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
  // ── Confidence indicator ────────────────────────────────────────────────────
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
}

const en: Translations = {
  appTitle: 'Suilana Transaction Explainer',
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
    `{{${s}}} executed a transaction on Sui.`,
  // Role labels
  roleSender: 'Sender',
  roleRecipient: 'Recipient',
  roleProtocol: 'Protocol',
  roleContract: 'Contract',
  // Confidence
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
  headlineUnknown: 'Sui Transaction',
  headlineFailed: 'Failed Transaction',
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
    `{{${s}}} executou uma transação na Sui.`,
  // Role labels
  roleSender: 'Remetente',
  roleRecipient: 'Destinatário',
  roleProtocol: 'Protocolo',
  roleContract: 'Contrato',
  // Confidence
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
  headlineUnknown: 'Transação Sui',
  headlineFailed: 'Transação Falhou',
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
    `{{${s}}} ejecutó una transacción en Sui.`,
  // Role labels
  roleSender: 'Remitente',
  roleRecipient: 'Destinatario',
  roleProtocol: 'Protocolo',
  roleContract: 'Contrato',
  // Confidence
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
  headlineUnknown: 'Transacción Sui',
  headlineFailed: 'Transacción Fallida',
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
