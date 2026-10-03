/** Scene identifiers for future multi-room expansion. */
export type GameSceneId = 'restaurant'

/** NPC ids used in dialogue and memory. */
export type NpcId = 'waiter' | 'emma' | 'player'

/**
 * Restaurant ordering task state machine.
 *
 * arrival → seated → browsing_menu → ordering ⇄ clarifying → confirming → completed
 */
export type TaskState =
  | 'arrival'
  | 'seated'
  | 'browsing_menu'
  | 'ordering'
  | 'clarifying'
  | 'confirming'
  | 'completed'

export type NpcEmotion =
  | 'neutral'
  | 'friendly'
  | 'confused'
  | 'patient'
  | 'cheerful'

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: 'main' | 'drink' | 'side' | 'dessert'
  allergens?: string[]
  tags?: string[]
}

export type OrderItem = {
  itemId: string
  name: string
  qty: number
  note?: string
}

export type OrderDelta = {
  add: Array<Pick<OrderItem, 'itemId' | 'qty'> & { name?: string; note?: string }>
  remove: Array<{ itemId: string; qty?: number }>
  update: Array<{ itemId: string; qty: number; note?: string }>
}

export type DialogueTurn = {
  id: string
  speaker: NpcId
  text: string
  taskState: TaskState
  createdAt: number
}

/** Payload sent to the LLM / mock service each player turn. */
export type AiTurnRequest = {
  taskState: TaskState
  playerUtterance: string
  order: OrderItem[]
  menu: MenuItem[]
  recentDialogue: DialogueTurn[]
  playerAbilitySummary?: {
    naturalnessAvg: number
    weakTags: string[]
    masteredPhrases: string[]
  }
}

/**
 * Structured JSON expected from the waiter / Emma AI.
 * Keep this schema stable — Prompt and parsers depend on it.
 */
export type AiTurnResponse = {
  /** Who is speaking this turn (usually waiter; Emma for hints). */
  npcId: Exclude<NpcId, 'player'>
  /** Spoken line shown in DialogueBox. */
  reply: string
  /** Task state AFTER this turn is applied. */
  taskState: TaskState
  /** Incremental order mutations for this turn. */
  orderDelta: OrderDelta
  /** 0–1 naturalness score for the player's last utterance. */
  naturalness: number
  /** Optional Hint lines the UI may surface. */
  hints: string[]
  /** Phrases worth reviewing in settlement. */
  phrasesTaught: string[]
  emotion: NpcEmotion
  /** Whether the task machine should advance this turn. */
  advance: boolean
}

export type SettlementResult = {
  naturalnessAvg: number
  phrasesLearned: string[]
  clarifyingCount: number
  hintCount: number
  suggestions: string[]
}

export type NpcMemory = {
  waiter: {
    knownPreferences: string[]
    lastFailedPoints: string[]
    orderedItemIds: string[]
  }
  emma: {
    hintsGiven: number
    lastHintAt: number | null
  }
}

export type PlayerAbility = {
  naturalnessAvg: number
  masteredPhrases: string[]
  weakTags: string[]
  sessionsPlayed: number
}
