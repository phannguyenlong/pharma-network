import React, { useState } from 'react'
import { OrgProvider } from './contexts/OrgContext'
import Dashboard from './pages/Dashboard'
import AttackVectors from './pages/AttackVectors'
import Products from './pages/Products'
import DefenseMechanisms from './pages/DefenseMechanisms'
import Header from './components/Header'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <OrgProvider>
      <div className="min-h-screen bg-gray-50">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'attacks' && <AttackVectors />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'defenses' && <DefenseMechanisms />}
        </main>
      </div>
    </OrgProvider>
  )
}