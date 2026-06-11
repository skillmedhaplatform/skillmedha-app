import React from 'react'
import TextEditor from './editor'
// import SuportedTable from './utils/suportedTable'

const page = () => {
  return (
    <div>
        <div>
            <button>Supported Functions</button>
            <button>Support Table</button>
        </div>
      <TextEditor />
    </div>
  )
}

export default page
