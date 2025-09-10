import React from 'react'

const OrgContext = React.createContext({ org: 'manufacturer', setOrg: () => {} })

export function OrgProvider({ children }) {
  const [org, setOrg] = React.useState('manufacturer')
  const value = React.useMemo(() => ({ org, setOrg }), [org])
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg() {
  return React.useContext(OrgContext)
}


