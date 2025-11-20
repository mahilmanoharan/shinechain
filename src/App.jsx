import { useState, useEffect } from 'react'
import AddDeed from './AddDeed'
import DeedFeed from './DeedFeed'
import NetworkVisualization from './NetworkVisualization'
import { supabase } from './supabaseClient'
import { BackgroundBeams } from './BackgroundBeams'

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
    <div className="min-h-screen w-full relative bg-neutral-950 text-white overflow-x-hidden selection:bg-purple-500/30">
      <BackgroundBeams />

      {/* HEADER LAYER - Z-Index 50 to stay on top */}
      <div className="relative z-50 max-w-7xl mx-auto px-6 pt-8 pointer-events-none">
        <div className="pointer-events-auto mb-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 mb-4">
            ShineChain <span className="text-4xl animate-pulse">✨</span>
          </h1>

          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            {['feed', 'network'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-full font-medium transition-all border backdrop-blur-md ${
                  view === v
                    ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'bg-black/20 border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {v === 'feed' ? 'Feed View' : 'Network View'}
              </button>
            ))}
          </div>

          {/* Add Deed Form (Only shows in Feed view) */}
          {view === 'feed' && (
            <div className="max-w-2xl mx-auto text-left">
              <div className="bg-gray-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-lg">
                <AddDeed onAdded={handleAdded} prefillInspiredBy={prefillId} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FEED CONTENT LAYER */}
      {view === 'feed' && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
           <DeedFeed onSelectForInspire={handleSelectForInspire} />
        </div>
      )}

      {/* NETWORK VISUALIZATION LAYER - Full Screen Fixed Overlay */}
      {view === 'network' && (
        <div className="fixed inset-0 z-40">
          <NetworkVisualization
            deeds={allDeeds}
            highlightedDeedId={highlightedDeedId}
          />
        </div>
      )}
    </div>
  )
}

export default App