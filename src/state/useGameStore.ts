import { useState } from 'react'
import type { DialogueTurn, GameSceneId, OrderItem, TaskState } from '../types/game'

export type GameStore = {
  sceneId: GameSceneId
  taskState: TaskState
  order: OrderItem[]
  dialogue: DialogueTurn[]
  menuOpen: boolean
  settlementOpen: boolean
  setSceneId: (id: GameSceneId) => void
  setTaskState: (state: TaskState) => void
  setMenuOpen: (open: boolean) => void
  setSettlementOpen: (open: boolean) => void
  appendDialogue: (turn: DialogueTurn) => void
  setOrder: (order: OrderItem[]) => void
}

/**
 * Lightweight global game state (React hooks version).
 * Can be swapped for Zustand later if needed.
 */
export function useGameStore(): GameStore {
  const [sceneId, setSceneId] = useState<GameSceneId>('restaurant')
  const [taskState, setTaskState] = useState<TaskState>('arrival')
  const [order, setOrder] = useState<OrderItem[]>([])
  const [dialogue, appendDialogueState] = useState<DialogueTurn[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [settlementOpen, setSettlementOpen] = useState(false)

  return {
    sceneId,
    taskState,
    order,
    dialogue,
    menuOpen,
    settlementOpen,
    setSceneId,
    setTaskState,
    setMenuOpen,
    setSettlementOpen,
    appendDialogue: (turn) => appendDialogueState((prev) => [...prev, turn]),
    setOrder,
  }
}
