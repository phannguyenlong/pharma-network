import React from 'react'
import { Shield, Activity, AlertTriangle, Package, AlertCircle } from 'lucide-react'
import { useOrg } from '../contexts/OrgContext'

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: Activity },
  { id: 'attacks', name: 'Attack Vectors', icon: AlertTriangle },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'defenses', name: 'Defenses', icon: Shield },
]

const organizations = [
  { id: 'manufacturer', name: 'Manufacturer', icon: '🏭' },
  { id: 'distributor', name: 'Distributor', icon: '🚚' },
  { id: 'retailer', name: 'Retailer', icon: '🏪' },
]

export default function Header({ activeTab, setActiveTab }) {
  const { org, setOrg } = useOrg()

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pharma Chain Security</h1>
                <p className="text-xs text-gray-500">Attack Demonstration Platform</p>
              </div>
            </div>
            
            <nav className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Organization:</span>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm font-medium"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.icon} {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm">
              <AlertCircle className="w-4 h-4" />
              Research Mode
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}