import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function DeedFeed({ onSelectForInspire }) {
  const [deeds, setDeeds] = useState([])

  useEffect(() => {
    async function loadDeeds() {
      const { data, error } = await supabase
        .from('deeds')
        .select('id, description, inspired_by, created_at')
        .order('created_at', { ascending: false })
      if (!error) setDeeds(data)
    }
    loadDeeds()
  }, [])

  const inspireCounts = deeds.reduce((acc, d) => {
    if (d.inspired_by) acc[d.inspired_by] = (acc[d.inspired_by] || 0) + 1
    return acc
  }, {})

  const findDeedText = (id) => deeds.find(x => x.id === id)?.description

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {deeds.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center p-10 bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.5)] animate-fadeIn">
          <span className="text-6xl mb-4 animate-pulse">✨</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            No deeds yet
          </h2>
          <p className="text-gray-400 max-w-xs text-center">
            Be the first to shine! Add a good deed above and start a chain of inspiration.
          </p>
        </div>
      ) : (
        deeds.map((d) => (
          <div
            key={d.id}
            onClick={() => onSelectForInspire && onSelectForInspire(d.id)}
            className="
              cursor-pointer relative overflow-hidden
              p-5 rounded-2xl backdrop-blur-xl
              bg-gray-900/40 border border-purple-500/20
              shadow-[0_0_20px_rgba(0,0,0,0.4)]
              hover:shadow-[0_0_35px_rgba(0,0,0,0.6)]
              transition-all duration-300
              hover:-translate-y-1 hover:scale-[1.02]
            "
          >
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-purple-400/10" />
            <div className="relative text-lg font-semibold text-white leading-snug mb-3">
              {d.description}
            </div>
            {d.inspired_by && (
              <div className="relative text-sm text-purple-300 italic">
                Inspired by: "{findDeedText(d.inspired_by) || 'unknown'}"
              </div>
            )}
            {inspireCounts[d.id] > 0 && (
              <div className="mt-3 inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Inspired {inspireCounts[d.id]}
              </div>
            )}
            {onSelectForInspire && (
              <button
                className="mt-4 relative text-sm text-purple-400 font-medium hover:text-pink-400 hover:underline"
              >
                Build on this →
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
    
}