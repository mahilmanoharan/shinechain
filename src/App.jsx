import { useState, useEffect } from 'react'
import AddDeed from './AddDeed'
import DeedFeed from './DeedFeed'
import NetworkVisualization from './NetworkVisualization'
import { supabase } from './supabaseClient'

function App() {
  const [prefillId, setPrefillId] = useState(null)
  const [view, setView] = useState('feed')
  const [allDeeds, setAllDeeds] = useState([])
  const [highlightedDeedId, setHighlightedDeedId] = useState(null)

  useEffect(() => {
    let channel;

    async function loadDeeds() {
      const { data, error } = await supabase
        .from('deeds')
        .select('id, description, inspired_by, created_at')
        .order('created_at', { ascending: false })
      if (!error && data) setAllDeeds(data)
    }

    loadDeeds()

    // Realtime subscription
    channel = supabase
      .channel('network-deeds')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deeds' },
        payload => {
          setAllDeeds(prev => [payload.new, ...prev])
          setHighlightedDeedId(payload.new.id)
          setTimeout(() => setHighlightedDeedId(null), 3000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deeds' },
        payload => {
          setAllDeeds(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'deeds' },
        payload => {
          setAllDeeds(prev => prev.filter(d => d.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  function handleAdded(newRow) {
    setPrefillId(null)
    if (newRow) {
      setHighlightedDeedId(newRow.id)
      setTimeout(() => setHighlightedDeedId(null), 3000)
    }
  }

  function handleSelectForInspire(deedId) {
    setPrefillId(deedId)
    setView('feed')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              ShineChain
            </h1>
            <span className="text-4xl animate-pulse">✨</span>
          </div>

          {/* View Toggle */}
          <div className="flex gap-4 mb-6">
            {['feed', 'network'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  view === v
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {v === 'feed' ? 'Feed View' : 'Network View'}
              </button>
            ))}
          </div>

          {/* Add Deed Form */}
          {view === 'feed' && (
            <div className="bg-gray-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-lg">
              <AddDeed onAdded={handleAdded} prefillInspiredBy={prefillId} />
            </div>
          )}
        </div>

        {/* Main Content */}
        {view === 'network' ? (
          <div className="relative w-screen h-screen">
            <NetworkVisualization
              deeds={allDeeds}
              highlightedDeedId={highlightedDeedId}
            />
          </div>
        ) : (
          <div className="bg-gray-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-xl">
            <DeedFeed onSelectForInspire={handleSelectForInspire} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

