import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, Activity, CheckCircle, XCircle, Info } from 'lucide-react'
import { useOrg } from '../contexts/OrgContext'
import { api } from '../lib/api'

const initialScenarios = [
  {
    id: 'counterfeit',
    title: 'Counterfeit Product Injection',
    description: 'Exploit weak identity verification to inject fake products during ownership transfer',
    type: 'identity',
    status: 'ready',
    details: 'Target: Identity Management Layer | Method: Credential spoofing during transfer',
    impact: 'High',
    detection: 'Medium'
  },
  {
    id: 'state',
    title: 'State Database Manipulation',
    description: 'Direct CouchDB access to modify product state without blockchain records',
    type: 'database',
    status: 'ready',
    details: 'Target: CouchDB Port 5984 | Method: Direct database modification',
    impact: 'Critical',
    detection: 'Low'
  },
  {
    id: 'chaincode',
    title: 'Chaincode Logic Bomb',
    description: 'Hidden malicious code in chaincode update that activates under conditions',
    type: 'chaincode',
    status: 'ready',
    details: 'Target: Smart Contract Layer | Method: Malicious chaincode deployment',
    impact: 'Critical',
    detection: 'Very Low'
  },
  {
    id: 'network',
    title: 'Network Partition (Eclipse)',
    description: 'Isolate nodes from the network to manipulate consensus',
    type: 'network',
    status: 'ready',
    details: 'Target: Raft Consensus | Method: Flood peer connections',
    impact: 'High',
    detection: 'High'
  }
]

export default function AttackVectors() {
  const { org } = useOrg()
  const [scenarios, setScenarios] = useState(initialScenarios)
  const [executing, setExecuting] = useState(null)
  const [logs, setLogs] = useState([])

  const executeAttack = async (scenarioId) => {
    setExecuting(scenarioId)
    const scenario = scenarios.find(s => s.id === scenarioId)
    
    // Add attack initiation log
    addLog('info', `Initiating ${scenario.title}...`)

    // Simulate attack execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      let success = false
      
      if (scenarioId === 'counterfeit') {
        // Simulate counterfeit injection
        const fakeProduct = {
          productId: `FAKE${Date.now()}`,
          name: 'Counterfeit Drug',
          manufacturer: 'Unknown',
          batchNumber: 'FAKE001',
          manufactureDate: '2025-01-01',
          expiryDate: '2027-01-01'
        }
        
        try {
          await api.createProduct(fakeProduct, org)
          success = Math.random() > 0.4 // 60% success rate
        } catch (error) {
          success = false
        }
        
        addLog(success ? 'warning' : 'error', 
          success ? 'Counterfeit product injected successfully' : 'Identity verification prevented injection')
      } else if (scenarioId === 'state') {
        // Simulate state manipulation
        success = Math.random() > 0.2 // 80% success rate
        addLog(success ? 'warning' : 'error',
          success ? 'Direct CouchDB access achieved' : 'Database access blocked')
      } else if (scenarioId === 'chaincode') {
        // Simulate chaincode attack
        success = Math.random() > 0.5 // 50% success rate
        addLog(success ? 'critical' : 'error',
          success ? 'Logic bomb deployed in chaincode' : 'Chaincode validation failed')
      } else if (scenarioId === 'network') {
        // Simulate network partition
        success = Math.random() > 0.6 // 40% success rate
        addLog(success ? 'warning' : 'info',
          success ? 'Network partition created' : 'Network resilient to partition attempt')
      }
      
      // Update scenario status
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId 
          ? { ...s, status: success ? 'success' : 'failed' }
          : s
      ))
      
      // Final log
      addLog(success ? 'success' : 'error',
        `${scenario.title} ${success ? 'successful' : 'failed'}`)
      
    } catch (error) {
      console.error('Attack execution error:', error)
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { ...s, status: 'failed' } : s
      ))
    } finally {
      setExecuting(null)
    }
  }

  const addLog = (type, message) => {
    setLogs(prev => [{
      time: new Date().toISOString(),
      type,
      message
    }, ...prev].slice(0, 50))
  }

  const resetScenarios = () => {
    setScenarios(initialScenarios)
    setLogs([])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Attack Vector Demonstrations</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={resetScenarios}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Reset All
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Research & Educational Purpose Only
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scenarios.map(scenario => (
            <AttackScenario
              key={scenario.id}
              scenario={scenario}
              onExecute={() => executeAttack(scenario.id)}
              isExecuting={executing === scenario.id}
            />
          ))}
        </div>
      </div>

      <AttackLogs logs={logs} />
    </div>
  )
}

function AttackScenario({ scenario, onExecute, isExecuting }) {
  const getTypeColor = () => {
    switch(scenario.type) {
      case 'identity': return 'border-purple-500 bg-purple-50'
      case 'database': return 'border-orange-500 bg-orange-50'
      case 'chaincode': return 'border-red-500 bg-red-50'
      case 'network': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch(scenario.status) {
      case 'ready': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'executing': return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className={`border-2 rounded-lg p-6 transition-all ${getTypeColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {scenario.title}
            {getStatusIcon()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500">{scenario.details}</p>
            <div className="flex gap-4 text-xs">
              <span>Impact: <strong className="text-red-600">{scenario.impact}</strong></span>
              <span>Detection: <strong className="text-blue-600">{scenario.detection}</strong></span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onExecute}
        disabled={isExecuting || scenario.status === 'success'}
        className={`w-full py-2 px-4 rounded-md font-medium transition-all ${
          isExecuting || scenario.status === 'success'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isExecuting ? 'Executing...' : scenario.status === 'success' ? 'Completed' : 'Execute Attack'}
      </button>
    </div>
  )
}

function AttackLogs({ logs }) {
  const getLogColor = (type) => {
    switch(type) {
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'success': return 'text-green-400'
      case 'critical': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Attack Execution Logs</h3>
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500">No attack attempts yet...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`mb-1 ${getLogColor(log.type)}`}>
              [{new Date(log.time).toLocaleTimeString()}] {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}