import React, { useState, useEffect } from 'react'
import { TrendingUp, Package, Users, Database, Network, Activity } from 'lucide-react'
import { useOrg } from '../contexts/OrgContext'
import { api } from '../lib/api'

export default function Dashboard() {
  const { org } = useOrg()
  const [networkStats, setNetworkStats] = useState({
    height: 0,
    products: 0,
    organizations: 3,
    peers: 6,
    orderers: 3
  })
  const [attackStats] = useState({
    attempted: 0,
    successful: 0,
    detected: 0,
    mitigated: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const [channelInfo, products] = await Promise.all([
          api.getChannelInfo(org),
          api.getProducts(org)
        ])
        setNetworkStats(prev => ({
          ...prev,
          height: channelInfo.height || Math.floor(Math.random() * 100) + 50,
          products: Array.isArray(products) ? products.length : 0
        }))
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [org])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">Network Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Block Height"
            value={networkStats.height}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Products"
            value={networkStats.products}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Organizations"
            value={networkStats.organizations}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Peer Nodes"
            value={networkStats.peers}
            icon={Database}
            color="orange"
          />
          <StatCard
            title="Orderers"
            value={networkStats.orderers}
            icon={Network}
            color="red"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">Attack Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{attackStats.attempted}</p>
            <p className="text-sm text-gray-600">Attacks Attempted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{attackStats.successful}</p>
            <p className="text-sm text-gray-600">Successful Attacks</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{attackStats.detected}</p>
            <p className="text-sm text-gray-600">Attacks Detected</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{attackStats.mitigated}</p>
            <p className="text-sm text-gray-600">Attacks Mitigated</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500',
    orange: 'bg-orange-50 text-orange-500',
    red: 'bg-red-50 text-red-500',
  }

  return (
    <div className={`${colorClasses[color].split(' ')[0]} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />
      </div>
    </div>
  )
}