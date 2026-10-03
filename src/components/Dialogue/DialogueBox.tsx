/**
 * Layer 2 — NPC dialogue bubble / subtitle strip.
 */
export function DialogueBox() {
  return (
    <div className="dialogue-box" aria-live="polite">
      <p className="dialogue-box__speaker">Waiter</p>
      <p className="dialogue-box__text">Welcome! How many people today?</p>
    </div>
  )
}
