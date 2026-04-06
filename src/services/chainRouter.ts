import type { ParsedTransaction } from '../types/transaction'
import type { Language } from '../i18n'
import { fetchTransactionDetails } from './suiService'
import { fetchSolanaTransaction } from './solanaService'

export type Chain = 'sui' | 'solana'

/**
 * Detects the chain from the raw input string.
 *
 * Heuristics:
 *  - Solana transaction signatures are 64-byte values encoded as base58 → 87-88 chars
 *  - Sui transaction digests are 32-byte values encoded as base58 → ~44 chars
 */
export function detectChain(input: string): Chain {
  // Strip any whitespace that crept in
  const trimmed = input.trim()
  if (trimmed.length >= 80) return 'solana'
  return 'sui'
}

/**
 * Fetches and parses a transaction from the correct chain.
 * The `input` should already be a clean digest/signature (no URL).
 */
export async function fetchTransaction(
  input: string,
  language: Language,
): Promise<ParsedTransaction> {
  const chain = detectChain(input)
  if (chain === 'solana') {
    return fetchSolanaTransaction(input, language)
  }
  return fetchTransactionDetails(input, language)
}
