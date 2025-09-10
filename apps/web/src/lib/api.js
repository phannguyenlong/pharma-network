import axios from 'axios'
import { useOrg } from '../state/org.jsx'

export function useApi() {
  const { org } = useOrg()
  const client = axios.create({
    headers: { 'x-org': org }
  })
  return {
    health: async () => (await client.get('/health')).data,
    channelInfo: async () => (await client.get('/api/monitor/channel')).data,
    listProducts: async () => (await client.get('/api/products')).data,
    getProduct: async (id) => (await client.get(`/api/products/${id}`)).data,
    createProduct: async (payload) => (await client.post('/api/products', payload)).data,
    updateStatus: async (id, payload) => (await client.post(`/api/products/${id}/status`, payload)).data,
    transfer: async (id, payload) => (await client.post(`/api/products/${id}/transfer`, payload)).data,
    history: async (id) => (await client.get(`/api/products/${id}/history`)).data,
    markCounterfeit: async (id) => (await client.post(`/api/products/${id}/counterfeit`)).data,
  }
}


