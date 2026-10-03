import { RestaurantScene } from './components/GameWorld/RestaurantScene'
import { DialogueBox } from './components/Dialogue/DialogueBox'
import { InputArea } from './components/Dialogue/InputArea'
import { MenuModal } from './components/Interactive/MenuModal'
import { SettlementModal } from './components/Feedback/SettlementModal'
import './App.css'

/**
 * Fixed 16:9 game viewport. Layers stack inside `.game-frame`.
 */
function App() {
  return (
    <div className="app-shell">
      <div className="game-frame" role="application" aria-label="Language Game">
        <div className="layer layer--world">
          <RestaurantScene />
        </div>

        <div className="layer layer--dialogue">
          <DialogueBox />
          <InputArea />
        </div>

        <MenuModal open={false} />
        <SettlementModal open={false} />
      </div>
    </div>
  )
}

export default App
