import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Products from './Products.jsx'
import ProductDetail from './ProductDetail.jsx'
import CreateProduct from './CreateProduct.jsx'
import { OrgProvider, useOrg } from '../state/org.jsx'

function OrgSelector() {
  const { org, setOrg } = useOrg()
  return (
    <select value={org} onChange={e => setOrg(e.target.value)}>
      <option value="manufacturer">manufacturer</option>
      <option value="distributor">distributor</option>
      <option value="retailer">retailer</option>
    </select>
  )
}

export default function App() {
  return (
    <OrgProvider>
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
        <header style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Pharma Network</h2>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link to="/">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/products/new">Add Product</Link>
          </nav>
          <div style={{ marginLeft: 'auto' }}>
            <OrgSelector />
          </div>
        </header>
        <main style={{ marginTop: 16 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<CreateProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </OrgProvider>
  )
}


