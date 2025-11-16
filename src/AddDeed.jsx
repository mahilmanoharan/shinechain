import {useState} from 'react'
import {supabase} from './supabaseClient'

export default function AddDeed(){
    const[desc, setDesc] =useState('')
    
    async function handleSubmit(e){
        e.preventDefault()
        if (!desc) return

        const {error} = await supabase
        .from('deeds')
        .insert([{description:desc}])

        if (error){
            console.error('Error adding deed:', error)
        } else {
            setDesc('')
            alert('New link added to chain! ✨')
        }
    }

    return(
        <form onSubmit={handleSubmit} className="mb-4">
            <input 
            value={desc} 
            onChange = {(e) => setDesc(e.target.value)}
            placeholder="Describe your good deed..."
            className='border rounded p-2 w-full'
            />
            <button className="bg yellow-400 rounded px-4 py-2 mt-2">Add Link</button>
        </form>
    )
}
