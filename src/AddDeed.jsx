import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function AddDeed({ onAdded, prefillInspiredBy = null }) {
  const [desc, setDesc] = useState('')
  const [deeds, setDeeds] = useState([])
  const [inspiredBy, setInspiredBy] = useState(prefillInspiredBy) // id or null
  const [loading, setLoading] = useState(false)

  // load deeds for dropdown
  useEffect(() => {
    async function loadDeeds() {
      const { data, error } = await supabase
        .from('deeds')
        .select('id, description, created_at')
        .order('created_at', { ascending: false })
        .limit(50) // limit dropdown
      if (error) {
        console.error('loadDeeds error', error)
      } else {
        setDeeds(data)
      }
    }
    loadDeeds()
  }, [])

  useEffect(() => {
    // if parent passes a prefill id, set it
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
      .select() // returns the inserted row(s)
    setLoading(false)

    if (error) {
      console.error('insert error', error)
      alert('Error adding shine: ' + error.message)
    } else {
      setDesc('')
      setInspiredBy(null)
      if (onAdded) onAdded(data[0]) // let parent refresh or use new row
      else alert('Shine added! ✨')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe your good deed..."
        className="border rounded p-2 w-full"
      />

      {/* dropdown to choose which deed inspired this one */}
      <div className="mt-2 flex gap-2 items-center">
        <select
          value={inspiredBy || ''}
          onChange={(e) => setInspiredBy(e.target.value || null)}
          className="border rounded p-2 flex-1"
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
          className="bg-yellow-400 rounded px-4 py-2"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Add link ✨'}
        </button>
      </div>
    </form>
  )
}
