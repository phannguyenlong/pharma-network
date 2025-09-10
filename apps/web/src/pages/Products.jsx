import React from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../lib/api.js'
import { useOrg } from '../state/org.jsx'

export default function Products() {
  const api = useApi()
  const { org } = useOrg()
  const [items, setItems] = React.useState([])
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    setError('')
    api.listProducts()
      .then(data => {
        let arr = []
        if (Array.isArray(data)) {
          arr = data
        } else if (typeof data === 'string') {
          try { const parsed = JSON.parse(data); if (Array.isArray(parsed)) arr = parsed } catch {}
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.result)) arr = data.result
          else if (Array.isArray(data.records)) arr = data.records
          else if (Array.isArray(data.products)) arr = data.products
        }
        // Also handle array-of-bytes encoding from server
        if (arr.length && typeof arr[0] === 'number') {
          try {
            const text = new TextDecoder().decode(Uint8Array.from(arr))
            const parsed = JSON.parse(text)
            if (Array.isArray(parsed)) arr = parsed
          } catch {}
        }
        setItems(arr)
      })
      .catch(e => setError(e.message))
  }, [org])

  return (
    <div>
      <h3>Products</h3>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {items.length === 0 && !error && <p>No products found.</p>}
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', display: items.length ? 'table' : 'none' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.productId} style={{ borderBottom: '1px solid #eee' }}>
              <td>{p.productId}</td>
              <td>{p.name}</td>
              <td>{p.owner}</td>
              <td>{p.status}</td>
              <td>{p.location}</td>
              <td>
                <Link to={`/products/${p.productId}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


