import { useState } from 'react'
import DeedFeed from './DeedFeed'
import AddDeed from './AddDeed'

function App(){
  return(
    <div className="p-4 >">
      <h1 className="text-3xl font-bold mb-4">
        ShineChain ✨
      </h1>
      <AddDeed />
      <DeedFeed />
    </div>
  )

}


export default App
