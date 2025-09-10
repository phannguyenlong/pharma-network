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
    api.listProducts().then(setItems).catch(e => setError(e.message))
  }, [org])

  return (
    <div>
      <h3>Products</h3>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
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


