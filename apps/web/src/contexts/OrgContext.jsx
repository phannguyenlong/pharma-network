import React, { createContext, useContext, useState } from 'react'

const OrgContext = createContext()

export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider')
  }
  return context
}

export function OrgProvider({ children }) {
  const [org, setOrg] = useState('manufacturer')
  
  return (
    <OrgContext.Provider value={{ org, setOrg }}>
      {children}
    </OrgContext.Provider>
  )
}