import axios from 'axios'
import { useOrg } from '../state/org.jsx'

function normalize(data) {
  if (typeof data === 'string') {
    try { return JSON.parse(data) } catch { return data }
  }
  if (Array.isArray(data) && data.length && typeof data[0] === 'number') {
    try {
      const text = new TextDecoder().decode(Uint8Array.from(data))
      try { return JSON.parse(text) } catch { return text }
    } catch {}
  }
  if (data && typeof data === 'object') {
    // Server may already decode; pass through
    return data
  }
  return data
}

export function useApi() {
  const { org } = useOrg()
  const client = axios.create({ headers: { 'x-org': org } })
  return {
    health: async () => normalize((await client.get('/health')).data),
    channelInfo: async () => normalize((await client.get('/api/monitor/channel')).data),
    listProducts: async () => normalize((await client.get('/api/products')).data),
    getProduct: async (id) => normalize((await client.get(`/api/products/${id}`)).data),
    createProduct: async (payload) => normalize((await client.post('/api/products', payload)).data),
    updateStatus: async (id, payload) => normalize((await client.post(`/api/products/${id}/status`, payload)).data),
    transfer: async (id, payload) => normalize((await client.post(`/api/products/${id}/transfer`, payload)).data),
    history: async (id) => normalize((await client.get(`/api/products/${id}/history`)).data),
    markCounterfeit: async (id) => normalize((await client.post(`/api/products/${id}/counterfeit`)).data),
  }
}


