import {useEffect, useState} from 'react'
import { supabase } from './supabaseClient'

export default function DeedFeed(){
    const [deeds, setDeeds] = useState([])

    useEffect(()=>{
        async function loadDeeds(){
            const {data, error} = await supabase
            .from('deeds')
            .select('*')
            .order('created_at', {ascending: false})

            if (error){
                console.error('Error loading deeds:', error)
            } else {
                setDeeds(data)
            }
        }

        loadDeeds()
    }, [])
    
    return(
        <div>
            <h2 className="text-xl font bold mb-2">ShineChain Feed</h2>
            <ul>
                {deeds.map((d)=>(
                    <li key={d.id} className="p-2 border-b">
                        {d.description}
                    </li>
                ))}
            </ul>
        </div>
    )
}