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
      {deeds.map((d) => (
        <div
          key={d.id}
          className="cursor-pointer p-5 bg-gray-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-102"
          onClick={() => onSelectForInspire && onSelectForInspire(d.id)}
        >
          <div className="text-lg font-bold text-white mb-2">{d.description}</div>
          {d.inspired_by && (
            <div className="text-sm text-purple-300 italic">
              Inspired by: “{findDeedText(d.inspired_by) || 'unknown'}”
            </div>
          )}
          {inspireCounts[d.id] > 0 && (
            <div className="mt-2 inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Inspired {inspireCounts[d.id]}
            </div>
          )}
          {onSelectForInspire && (
            <button
              className="mt-2 text-sm text-purple-400 hover:text-pink-400 hover:underline font-medium"
            >
              Build on this
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
