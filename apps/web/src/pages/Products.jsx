import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { useOrg } from '../contexts/OrgContext'
import { api } from '../lib/api'

export default function Products() {
  const { org } = useOrg()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [org])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getProducts(org)
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const markAsCounterfeit = async (productId) => {
    try {
      await api.markCounterfeit(productId, org)
      await loadProducts()
    } catch (error) {
      console.error('Failed to mark counterfeit:', error)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'COUNTERFEIT') return 'text-red-600 bg-red-100'
    if (status === 'manufactured') return 'text-blue-600 bg-blue-100'
    if (status === 'in-distribution') return 'text-yellow-600 bg-yellow-100'
    if (status === 'at-retailer') return 'text-green-600 bg-green-100'
    if (status === 'sold') return 'text-purple-600 bg-purple-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Product Tracking</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Viewing as: <span className="font-semibold">{org}</span>
            </span>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Product
            </button>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No products found in the supply chain
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.productId}
                product={product}
                onView={() => setSelectedProduct(product)}
                onMarkCounterfeit={() => markAsCounterfeit(product.productId)}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showCreateForm && (
        <CreateProductForm
          org={org}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            loadProducts()
          }}
        />
      )}
    </div>
  )
}

function ProductCard({ product, onView, onMarkCounterfeit, getStatusColor }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{product.name}</h4>
          <p className="text-sm text-gray-600">{product.productId}</p>
        </div>
        {product.verified === false && (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Owner:</span>
          <span className="font-medium">{product.owner}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">{product.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          View Details
        </button>
        {product.status !== 'COUNTERFEIT' && (
          <button
            onClick={onMarkCounterfeit}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Flag
          </button>
        )}
      </div>
    </div>
  )
}

function ProductModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Product Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(product, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function CreateProductForm({ org, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    manufacturer: 'PharmaCorp',
    batchNumber: '',
    manufactureDate: '',
    expiryDate: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createProduct(formData, org)
      onSuccess()
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Create Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product ID"
            value={formData.productId}
            onChange={(e) => setFormData({...formData, productId: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Batch Number"
            value={formData.batchNumber}
            onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="date"
            placeholder="Manufacture Date"
            value={formData.manufactureDate}
            onChange={(e) => setFormData({...formData, manufactureDate: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="date"
            placeholder="Expiry Date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  )
}