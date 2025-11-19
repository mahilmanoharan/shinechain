import { useState } from 'react'
import AddDeed from './AddDeed'
import DeedFeed from './DeedFeed'

function App() {
  const [prefillId, setPrefillId] = useState(null)
  const [refreshFlag, setRefreshFlag] = useState(0) // simple way to trigger reloads

  function handleAdded(newRow) {
    // bump refresh flag so feed reloads or you can implement more targeted updates
    setRefreshFlag((n) => n + 1)
    setPrefillId(null)
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">ShineChain ✨</h1>

      <AddDeed onAdded={handleAdded} prefillInspiredBy={prefillId} />

      {/* pass a callback so user can click "Build on this" */}
      <DeedFeed key={refreshFlag} onSelectForInspire={setPrefillId} />
    </div>
  )
}

export default App
