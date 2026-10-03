import type { AiTurnRequest, AiTurnResponse, TaskState } from '../types/game'

const NEXT_STATE: Partial<Record<TaskState, TaskState>> = {
  arrival: 'seated',
  seated: 'browsing_menu',
  browsing_menu: 'ordering',
  ordering: 'confirming',
  clarifying: 'ordering',
  confirming: 'completed',
}

/**
 * Offline Mock AI — deterministic replies so local play does not burn tokens.
 */
export async function requestMockAiTurn(
  request: AiTurnRequest,
): Promise<AiTurnResponse> {
  const current = request.taskState
  const advance = current !== 'completed' && current !== 'clarifying'
  const nextState = advance ? (NEXT_STATE[current] ?? current) : current

  const scripts: Partial<Record<TaskState, string>> = {
    arrival: 'Welcome! How many people today?',
    seated: 'Here is the menu. Would you like something to drink first?',
    browsing_menu: 'Our grilled salmon is popular today. Ready to order?',
    ordering: "Got it. Anything else?",
    clarifying: 'Sorry, did you mean the grilled salmon or the pasta?',
    confirming: 'So that is one grilled salmon and a coke. Is that correct?',
    completed: 'Perfect! Your food will be right out. Enjoy!',
  }

  return {
    npcId: 'waiter',
    reply: scripts[current] ?? 'How can I help you?',
    taskState: nextState,
    orderDelta: { add: [], remove: [], update: [] },
    naturalness: 0.75,
    hints: ["Try: \"I'd like the grilled salmon, please.\""],
    phrasesTaught: ["I'd like ...", 'Anything else?'],
    emotion: 'friendly',
    advance,
  }
}
