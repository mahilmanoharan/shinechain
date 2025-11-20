import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function DeedFeed({ onSelectForInspire }) {
  const [deeds, setDeeds] = useState([])

  useEffect(() => {
    async function loadInitial() {
      // fetch deeds
      const { data, error } = await supabase
        .from('deeds')
        .select('id, description, inspired_by, created_at')
        .order('created_at', { ascending: false })

      if (!error) setDeeds(data)
    }
    
    loadInitial()

    // realtime channel creation
    const channel = supabase.channel('deeds-changes')

        // listen for INSERT events
        .on(
            'postgres_changes',
            {event: 'INSERT', schema: 'public', table: 'deeds'},
            (payload)=>{
                console.log('New deed received:',payload.new)

                //Add new row to top of feed
                setDeeds(prev=> [payload.new, ...prev])
            }
        )

        //listen for UPDATE  events
        .on(
            'postgres_changes',
            {event:'UPDATE', schema:'public', table: 'deeds'},
            (payload) => {
                console.log('Updated deed:',payload.new)

                setDeeds(prev=>
                    prev.map(d => d.id === payload.new.id ? payload.new : d)
                )
            }
        )


        // Listen for DELETE events
        .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'deeds'},
            (payload)=> {
                console.log('Deleted deed:', payload.old)

                setDeeds(prev =>
                    prev.filter(d => d.id !== payload.old.id)
                )
            }
        )

        .subscribe()

        //Clean up channel on component unmount
        return() => {
            supabase.removeChannel(channel)
        }
  }, [])

  // counts times each deed inspired another
  const inspireCounts = deeds.reduce((acc, d) => {
    if (d.inspired_by) {
      acc[d.inspired_by] = (acc[d.inspired_by] || 0) + 1
    }
    return acc
  }, {})

  // helper to find description of a parent deed (if present)
  const findDeedText = (id) => deeds.find((x) => x.id === id)?.description

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">ShineChain Feed</h2>
      <ul>
        {deeds.map((d) => (
          <li key={d.id} className="p-3 border-b flex justify-between items-start gap-3">
            <div>
              <div className="text-base">{d.description}</div>

              {/* show inspired by with snippet */}
              {d.inspired_by && (
                <div className="text-sm text-gray-400 mt-1">
                  Inspired by: “{findDeedText(d.inspired_by) || 'unknown'}”
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm">{new Date(d.created_at).toLocaleString()}</div>

              {/* show count of how many this deed inspired */}
              <div className="text-xs mt-1">
                Inspired <strong>{inspireCounts[d.id] || 0}</strong>
              </div>

              {/* quick action: start a new deed inspired by this one */}
              <button
                className="mt-2 text-sm underline"
                onClick={() => onSelectForInspire && onSelectForInspire(d.id)}
              >
                Build on this
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
