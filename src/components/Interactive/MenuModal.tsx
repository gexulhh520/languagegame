/**
 * Interactive prop — English menu on the table.
 */
export function MenuModal({ open = false }: { open?: boolean }) {
  if (!open) return null

  return (
    <div className="menu-modal" role="dialog" aria-label="Restaurant menu">
      <h2>Today&apos;s Menu</h2>
      <p>Menu content will be loaded from game data.</p>
    </div>
  )
}
