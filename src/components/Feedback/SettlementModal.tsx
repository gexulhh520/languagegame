/**
 * Layer 3 — level settlement: naturalness score + phrase review.
 */
export function SettlementModal({ open = false }: { open?: boolean }) {
  if (!open) return null

  return (
    <div className="settlement-modal" role="dialog" aria-label="Level settlement">
      <h2>Great job!</h2>
      <p>Naturalness and new phrases will appear here.</p>
    </div>
  )
}
