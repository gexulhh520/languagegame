/**
 * Layer 2 — player text input + Hint button.
 */
export function InputArea() {
  return (
    <form
      className="input-area"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <input
        className="input-area__field"
        type="text"
        placeholder="Type your reply in English..."
        aria-label="Player reply"
      />
      <button type="button" className="input-area__hint">
        Hint
      </button>
      <button type="submit" className="input-area__send">
        Send
      </button>
    </form>
  )
}
