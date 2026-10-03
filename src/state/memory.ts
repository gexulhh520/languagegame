import type { NpcMemory, PlayerAbility } from '../types/game'

const NPC_KEY = 'languagegame.npcMemory'
const ABILITY_KEY = 'languagegame.playerAbility'

const defaultNpcMemory: NpcMemory = {
  waiter: {
    knownPreferences: [],
    lastFailedPoints: [],
    orderedItemIds: [],
  },
  emma: {
    hintsGiven: 0,
    lastHintAt: null,
  },
}

const defaultAbility: PlayerAbility = {
  naturalnessAvg: 0,
  masteredPhrases: [],
  weakTags: [],
  sessionsPlayed: 0,
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) } as T
  } catch {
    return fallback
  }
}

export function loadNpcMemory(): NpcMemory {
  return readJson(NPC_KEY, defaultNpcMemory)
}

export function saveNpcMemory(memory: NpcMemory): void {
  localStorage.setItem(NPC_KEY, JSON.stringify(memory))
}

export function loadPlayerAbility(): PlayerAbility {
  return readJson(ABILITY_KEY, defaultAbility)
}

export function savePlayerAbility(ability: PlayerAbility): void {
  localStorage.setItem(ABILITY_KEY, JSON.stringify(ability))
}
