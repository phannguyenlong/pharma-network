import React from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../lib/api.js'
import { useOrg } from '../state/org.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const api = useApi()
  const { org } = useOrg()
  const [p, setP] = React.useState(null)
  const [hist, setHist] = React.useState([])
  const [error, setError] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [temp, setTemp] = React.useState('')
  const [newOwner, setNewOwner] = React.useState('distributor')
  const [location, setLocation] = React.useState('')

  async function reload() {
    try {
      const [a, b] = await Promise.all([
        api.getProduct(id),
        api.history(id)
      ])
      setP(a)
      setHist(b)
    } catch (e) {
      setError(e.message)
    }
  }

  React.useEffect(() => { reload() }, [id, org])

  async function updateStatus() {
    try {
      await api.updateStatus(id, { status, temperature: temp })
      await reload()
    } catch (e) { setError(e.message) }
  }

  async function transfer() {
    try {
      await api.transfer(id, { newOwner, location })
      await reload()
    } catch (e) { setError(e.message) }
  }

  async function counterfeit() {
    try { await api.markCounterfeit(id); await reload() } catch (e) { setError(e.message) }
  }

  if (!p) return <p>Loading...</p>

  return (
    <div>
      <h3>Product: {p.productId}</h3>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <h4>Details</h4>
          <pre style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(p, null, 2)}
          </pre>
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <h4>Update Status</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder="status" value={status} onChange={e => setStatus(e.target.value)} />
              <input placeholder="temperature" value={temp} onChange={e => setTemp(e.target.value)} />
              <button onClick={updateStatus}>Update</button>
            </div>
          </div>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <h4>Transfer</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              <select value={newOwner} onChange={e => setNewOwner(e.target.value)}>
                <option value="manufacturer">manufacturer</option>
                <option value="distributor">distributor</option>
                <option value="retailer">retailer</option>
                <option value="customer">customer</option>
              </select>
              <input placeholder="location" value={location} onChange={e => setLocation(e.target.value)} />
              <button onClick={transfer}>Transfer</button>
            </div>
          </div>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <h4>Mark Counterfeit</h4>
            <button onClick={counterfeit} style={{ color: 'white', background: 'crimson', padding: '6px 10px' }}>Mark</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h4>History</h4>
        <pre style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          {JSON.stringify(hist, null, 2)}
        </pre>
      </div>
    </div>
  )
}


