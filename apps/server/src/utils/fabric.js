import fs from 'fs';
import path from 'path';
import { promises as fsp } from 'fs';
import { connect, signers } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import { createPrivateKey } from 'crypto';

function findRepoRoot(startDir = process.cwd()) {
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    const orgs = path.join(current, 'organizations');
    const net = path.join(current, 'network.sh');
    if (fs.existsSync(orgs) && fs.existsSync(net)) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir; // fallback
}

const REPO_ROOT = findRepoRoot();

function getOrgConfig(org) {
  const base = path.join(REPO_ROOT, 'organizations/peerOrganizations');
  if (org === 'manufacturer') {
    return {
      mspId: 'ManufacturerMSP',
      peerEndpoint: process.env.MANUFACTURER_PEER_ENDPOINT || 'localhost:7051',
      tlsCertPath: process.env.MANUFACTURER_TLS_CA || path.join(base, 'manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt'),
      adminMspPath: process.env.MANUFACTURER_ADMIN_MSP || path.join(base, 'manufacturer.pharma.com/users/Admin@manufacturer.pharma.com/msp'),
    };
  }
  if (org === 'distributor') {
    return {
      mspId: 'DistributorMSP',
      peerEndpoint: process.env.DISTRIBUTOR_PEER_ENDPOINT || 'localhost:9051',
      tlsCertPath: process.env.DISTRIBUTOR_TLS_CA || path.join(base, 'distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt'),
      adminMspPath: process.env.DISTRIBUTOR_ADMIN_MSP || path.join(base, 'distributor.pharma.com/users/Admin@distributor.pharma.com/msp'),
    };
  }
  if (org === 'retailer') {
    return {
      mspId: 'RetailerMSP',
      peerEndpoint: process.env.RETAILER_PEER_ENDPOINT || 'localhost:11051',
      tlsCertPath: process.env.RETAILER_TLS_CA || path.join(base, 'retailer.pharma.com/peers/peer0.retailer.pharma.com/tls/ca.crt'),
      adminMspPath: process.env.RETAILER_ADMIN_MSP || path.join(base, 'retailer.pharma.com/users/Admin@retailer.pharma.com/msp'),
    };
  }
  throw new Error(`Unknown org: ${org}`);
}

async function newGrpcClient(tlsCertPath, peerEndpoint, serverNameOverride) {
  const tlsRootCert = await fsp.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, { 'grpc.ssl_target_name_override': serverNameOverride });
}

async function newIdentity(mspId, adminMspPath) {
  const certPath = path.join(adminMspPath, 'signcerts');
  const [certFile] = (await fsp.readdir(certPath)).filter(f => f.endsWith('.pem'));
  const credentials = await fsp.readFile(path.join(certPath, certFile));
  return { mspId, credentials };
}

async function newSigner(adminMspPath) {
  const keyPath = path.join(adminMspPath, 'keystore');
  const [keyFile] = (await fsp.readdir(keyPath)).filter(f => f.endsWith('_sk') || f.endsWith('.pem'));
  const privateKeyPem = await fsp.readFile(path.join(keyPath, keyFile));
  const privateKey = createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

export async function connectGatewayForOrg(org) {
  const cfg = getOrgConfig(org);
  const client = await newGrpcClient(cfg.tlsCertPath, cfg.peerEndpoint, `peer0.${org}.pharma.com`);
  const identity = await newIdentity(cfg.mspId, cfg.adminMspPath);
  const signer = await newSigner(cfg.adminMspPath);
  return connect({ client, identity, signer });
}

export async function getContractForOrg(org, channelName, chaincodeName) {
  const gateway = await connectGatewayForOrg(org);
  const network = await gateway.getNetwork(channelName);
  return { gateway, contract: network.getContract(chaincodeName) };
}


