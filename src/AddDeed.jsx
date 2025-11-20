import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function AddDeed({ onAdded, prefillInspiredBy = null }) {
  const [desc, setDesc] = useState('')
  const [deeds, setDeeds] = useState([])
  const [inspiredBy, setInspiredBy] = useState(prefillInspiredBy)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadDeeds() {
      const { data, error } = await supabase
        .from('deeds')
        .select('id, description, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) {
        console.error('loadDeeds error', error)
      } else {
        setDeeds(data)
      }
    }
    loadDeeds()
  }, [])

  useEffect(() => {
    if (prefillInspiredBy) setInspiredBy(prefillInspiredBy)
  }, [prefillInspiredBy])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!desc.trim()) return
    setLoading(true)
    
    const payload = { description: desc.trim() }
    if (inspiredBy) payload.inspired_by = inspiredBy
    
    const { data, error } = await supabase
      .from('deeds')
      .insert([payload])
      .select()
    
    setLoading(false)
    
    if (error) {
      console.error('insert error', error)
      alert('Error adding shine: ' + error.message)
    } else {
      setDesc('')
      setInspiredBy(null)
      if (onAdded) onAdded(data[0])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe your good deed..."
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
      </div>
      
      <div className="flex gap-3">
        <select
          value={inspiredBy || ''}
          onChange={(e) => setInspiredBy(e.target.value || null)}
          className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
        >
          <option value="">No inspiration / start a chain</option>
          {deeds.map((d) => (
            <option key={d.id} value={d.id}>
              {d.description.length > 60 ? d.description.slice(0, 60) + '…' : d.description}
            </option>
          ))}
        </select>
        
        <button
          type="submit"
          className="bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <span>Add link</span>
              <span className="text-xl">✨</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}