import type { AiTurnRequest, AiTurnResponse } from '../types/game'

/**
 * Real LLM API client — Prompt assembly + structured JSON parse.
 * Stubbed until an API key / provider is configured.
 */
export async function requestAiTurn(
  _request: AiTurnRequest,
): Promise<AiTurnResponse> {
  throw new Error(
    'aiService is not configured yet. Use mockAiService during development.',
  )
}
