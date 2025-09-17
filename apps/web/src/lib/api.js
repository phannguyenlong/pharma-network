import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Product operations
  getProducts: (org) => 
    client.get('/products', { headers: { 'x-org': org } }).then(res => res.data),
  
  getProduct: (id, org) => 
    client.get(`/products/${id}`, { headers: { 'x-org': org } }).then(res => res.data),
  
  createProduct: (data, org) => 
    client.post('/products', data, { headers: { 'x-org': org } }).then(res => res.data),
  
  updateStatus: (id, data, org) => 
    client.post(`/products/${id}/status`, data, { headers: { 'x-org': org } }).then(res => res.data),
  
  transfer: (id, data, org) => 
    client.post(`/products/${id}/transfer`, data, { headers: { 'x-org': org } }).then(res => res.data),
  
  getHistory: (id, org) => 
    client.get(`/products/${id}/history`, { headers: { 'x-org': org } }).then(res => res.data),
  
  markCounterfeit: (id, org) => 
    client.post(`/products/${id}/counterfeit`, {}, { headers: { 'x-org': org } }).then(res => res.data),
  
  // Network monitoring
  getChannelInfo: (org) => 
    client.get('/monitor/channel', { headers: { 'x-org': org } }).then(res => res.data),
}