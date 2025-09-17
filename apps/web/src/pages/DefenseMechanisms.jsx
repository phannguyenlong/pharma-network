import React, { useState } from 'react'
import { Shield, Info } from 'lucide-react'

const initialDefenses = [
  {
    id: 'multi-verify',
    name: 'Multi-Party Verification',
    description: 'Require signatures from multiple organizations for product registration',
    status: 'inactive',
    effectiveness: 85,
    overhead: 20
  },
  {
    id: 'state-reconcile',
    name: 'State-Ledger Reconciliation',
    description: 'Periodic comparison between CouchDB state and blockchain records',
    status: 'inactive',
    effectiveness: 95,
    overhead: 15
  },
  {
    id: 'chaincode-integrity',
    name: 'Chaincode Integrity Checking',
    description: 'Hash verification of deployed chaincode against approved versions',
    status: 'inactive',
    effectiveness: 90,
    overhead: 10
  },
  {
    id: 'network-monitor',
    name: 'Network Partition Detection',
    description: 'Monitor peer connectivity and consensus participation',
    status: 'inactive',
    effectiveness: 75,
    overhead: 25
  }
]

export default function DefenseMechanisms() {
  const [defenses, setDefenses] = useState(initialDefenses)

  const toggleDefense = (defenseId) => {
    setDefenses(prev => prev.map(d => 
      d.id === defenseId 
        ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' }
        : d
    ))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Defense Mechanisms</h2>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">
              Active Defenses: {defenses.filter(d => d.status === 'active').length}/{defenses.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {defenses.map(defense => (
            <DefenseCard
              key={defense.id}
              defense={defense}
              onToggle={() => toggleDefense(defense.id)}
            />
          ))}
        </div>
      </div>

      <ResearchNote />
    </div>
  )
}

function DefenseCard({ defense, onToggle }) {
  return (
    <div className={`border rounded-lg p-6 transition-all ${
      defense.status === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{defense.name}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              defense.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {defense.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{defense.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Effectiveness</span>
                <span className="text-sm font-medium">{defense.effectiveness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${defense.effectiveness}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Performance Overhead</span>
                <span className="text-sm font-medium">{defense.overhead}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${defense.overhead}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={`ml-4 px-4 py-2 rounded-md font-medium transition-all ${
            defense.status === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {defense.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

function ResearchNote() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Research Note</h4>
          <p className="text-blue-800 text-sm">
            These defense mechanisms are part of the research to demonstrate how blockchain-based supply chains 
            can be hardened against various attack vectors. Each defense targets specific vulnerabilities 
            identified in the Hyperledger Fabric implementation.
          </p>
        </div>
      </div>
    </div>
  )
}