import React from 'react'
import BSTyles from "./bStyle.module.scss"

const BTag = ({children}) => {
  return (
    <button className={BSTyles.container}>
        {children}
    </button>
  )
}

export default BTag
