import React from 'react'
import { useApi } from '../lib/api.js'
import { useOrg } from '../state/org.jsx'

export default function Dashboard() {
  const api = useApi()
  const { org } = useOrg()
  const [info, setInfo] = React.useState(null)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    api.channelInfo().then(setInfo).catch(e => setError(e.message))
    return () => { mounted = false }
  }, [org])

  return (
    <div>
      <h3>Network Dashboard</h3>
      <p>Active organization context: <b>{org}</b></p>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {!info ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Channel</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>supply-chain-channel</div>
          </div>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Height</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{info.height}</div>
          </div>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Block Hash</div>
            <div style={{ fontSize: 14, fontFamily: 'monospace' }}>{info.currentBlockHash?.slice?.(0, 24)}...</div>
          </div>
        </div>
      )}
    </div>
  )
}


