import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../lib/api.js'

export default function CreateProduct() {
  const api = useApi()
  const nav = useNavigate()
  const [form, setForm] = React.useState({
    productId: '', name: '', manufacturer: 'PharmaCorp', batchNumber: '', manufactureDate: '', expiryDate: ''
  })
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.createProduct(form)
      nav('/products')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function field(name, type = 'text') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <label>{name}</label>
        <input type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />
      </div>
    )
  }

  return (
    <div>
      <h3>Add Product</h3>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        {field('productId')}
        {field('name')}
        {field('manufacturer')}
        {field('batchNumber')}
        {field('manufactureDate', 'date')}
        {field('expiryDate', 'date')}
        <div>
          <button disabled={loading} type="submit">Create</button>
        </div>
      </form>
    </div>
  )
}


