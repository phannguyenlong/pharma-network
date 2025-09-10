import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectGatewayForOrg, getContractForOrg } from './utils/fabric.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const CHANNEL_NAME = process.env.CHANNEL_NAME || 'supply-chain-channel';
const CHAINCODE_NAME = process.env.CHAINCODE_NAME || 'pharma-supply';

// health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// middleware to establish gateway per request based on org header/query
async function withContract(req, res, next) {
  const org = (req.headers['x-org'] || req.query.org || '').toString();
  if (!org) {
    return res.status(400).json({ error: 'Missing org. Provide header x-org: manufacturer|distributor|retailer' });
  }
  try {
    const gw = await connectGatewayForOrg(org);
    req.fabric = {
      gateway: gw,
      network: await gw.getNetwork(CHANNEL_NAME),
    };
    req.fabric.contract = req.fabric.network.getContract(CHAINCODE_NAME);
    next();
  } catch (e) {
    console.error('Gateway error', e);
    res.status(500).json({ error: 'Failed to connect to Fabric gateway', details: e.message });
  }
}

// Products API
app.post('/api/products', withContract, async (req, res) => {
  const { productId, name, manufacturer, batchNumber, manufactureDate, expiryDate } = req.body || {};
  if (!productId || !name || !manufacturer || !batchNumber || !manufactureDate || !expiryDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await req.fabric.contract.submitTransaction('CreateProduct', productId, name, manufacturer, batchNumber, manufactureDate, expiryDate);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.get('/api/products/:id', withContract, async (req, res) => {
  try {
    const result = await req.fabric.contract.evaluateTransaction('QueryProduct', req.params.id);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(404).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.get('/api/products', withContract, async (req, res) => {
  try {
    const result = await req.fabric.contract.evaluateTransaction('GetAllProducts');
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.post('/api/products/:id/status', withContract, async (req, res) => {
  const { status, temperature } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
  try {
    const result = await req.fabric.contract.submitTransaction('UpdateProductStatus', req.params.id, status, temperature || '');
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.post('/api/products/:id/transfer', withContract, async (req, res) => {
  const { newOwner, location } = req.body || {};
  if (!newOwner || !location) {
    return res.status(400).json({ error: 'Missing newOwner or location' });
  }
  try {
    const result = await req.fabric.contract.submitTransaction('TransferProduct', req.params.id, newOwner, location);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.get('/api/products/:id/history', withContract, async (req, res) => {
  try {
    const result = await req.fabric.contract.evaluateTransaction('GetProductHistory', req.params.id);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

app.post('/api/products/:id/counterfeit', withContract, async (req, res) => {
  try {
    const result = await req.fabric.contract.submitTransaction('MarkCounterfeit', req.params.id);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

// Monitoring (basic)
app.get('/api/monitor/channel', withContract, async (req, res) => {
  try {
    const info = await req.fabric.network.getChannel().queryInfo();
    res.json({ height: info.height?.toString?.() || String(info.height), currentBlockHash: info.currentBlockHash?.toString('hex') });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await req.fabric.gateway.close();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


