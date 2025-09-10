## Pharmaceutical Supply Network Topology (Hyperledger Fabric 2.5)

### Purpose
This document describes the complete network topology for the pharmaceutical supply network, including organizations, ordering service, peers, databases, channels, TLS, identities, chaincode deployment model, ports, and operational considerations.

---

## High-level Architecture

- **Consortium**: `PharmaConsortium`
  - **Organizations**: Manufacturer, Distributor, Retailer
  - **Application Channel**: `supply-chain-channel`
- **Ordering Service**: 3-node Raft (etcdraft): `orderer1`, `orderer2`, `orderer3`
- **Peers**: 2 per organization (total 6)
- **State Database**: CouchDB per peer
- **TLS**: Enabled for all network components (peers and orderers)
- **Chaincode**: Node.js contract `pharma-supply` deployed to the channel
- **Container Network**: `fabric_pharma` (Docker network)

### Logical Diagram (simplified)
```
  Clients (SDKs) ───────────────────────────────────────────────────────────────────┐
                                                                                   │
  ┌──────────────┐      ┌───────────────────────────────┐      ┌───────────────┐    │
  │ Manufacturer │      │         Distributor           │      │    Retailer   │    │
  │  (Org1/MSP)  │      │          (Org2/MSP)           │      │   (Org3/MSP)  │    │
  │              │      │                               │      │               │    │
  │ peer0  peer1 │      │  peer0               peer1    │      │ peer0   peer1 │    │
  │  +CDB  +CDB  │      │   +CDB               +CDB     │      │  +CDB   +CDB  │    │
  └────┬────┬────┘      └────┬──────────────────┬───────┘      └────┬─────┬────┘    │
       │    │                 │                  │                   │     │         │
       └─────────── Gossip/Endorsement/Delivery on supply-chain-channel ────────────┘
                               │                  │
                               ▼                  ▼
                         ┌───────────────────────────────┐
                         │    Ordering Service (Raft)    │
                         │ orderer1  orderer2  orderer3  │
                         └───────────────────────────────┘
```

---

## Organizations and MSPs

- **Manufacturer**
  - MSP ID: `ManufacturerMSP`
  - Domain: `manufacturer.pharma.com`
  - Peers: `peer0.manufacturer.pharma.com`, `peer1.manufacturer.pharma.com`
  - Anchor Peer: `peer0.manufacturer.pharma.com:7051`

- **Distributor**
  - MSP ID: `DistributorMSP`
  - Domain: `distributor.pharma.com`
  - Peers: `peer0.distributor.pharma.com`, `peer1.distributor.pharma.com`
  - Anchor Peer: `peer0.distributor.pharma.com:9051`

- **Retailer**
  - MSP ID: `RetailerMSP`
  - Domain: `retailer.pharma.com`
  - Peers: `peer0.retailer.pharma.com`, `peer1.retailer.pharma.com`
  - Anchor Peer: `peer0.retailer.pharma.com:11051`

Identities are generated using `cryptogen` with NodeOUs enabled. Admin, peer, and user identities are created per org. Connection profiles for clients are produced via `scripts/ccp-generate.sh` based on `organizations/ccp/ccp-template.yaml`.

---

## Ordering Service (Raft)

- **Type**: `etcdraft`
- **Nodes**:
  - `orderer1.pharma.com`
    - Client/Deliver port: `7050`
    - Admin (osnadmin) port: `7053`
    - Operations port: `9443`
  - `orderer2.pharma.com`
    - Client/Deliver port: `8050`
    - Admin (osnadmin) port: `8053`
    - Operations port: `9444`
  - `orderer3.pharma.com`
    - Client/Deliver port: `9050`
    - Admin (osnadmin) port: `9053`
    - Operations port: `9445`

- **TLS**: Enabled; each orderer has TLS key/cert and trusts the TLS CA.
- **Channel Participation API**: Enabled (`ORDERER_CHANNELPARTICIPATION_ENABLED=true`). Orderers join the application channel using `osnadmin channel join` against their admin ports.
- **Persistence**: Named Docker volumes per orderer map to `/var/hyperledger/production/orderer`.

---

## Peers and Databases

Each organization has two peers. TLS is enabled; CouchDB is configured as the state database.

### Manufacturer
- `peer0.manufacturer.pharma.com`
  - Peer port: `7051`
  - Chaincode port: `7052`
  - Operations port: `9446`
  - Gossip bootstrap: `peer1.manufacturer.pharma.com:8051`
  - CouchDB: `couchdb0.manufacturer` at `5984` (host-mapped `5984`)
  - Persistence: `peer0.manufacturer.pharma.com:/var/hyperledger/production`

- `peer1.manufacturer.pharma.com`
  - Peer port: `8051`
  - Chaincode port: `8052`
  - Operations port: `9447`
  - Gossip bootstrap: `peer0.manufacturer.pharma.com:7051`
  - CouchDB: `couchdb1.manufacturer` at `5984` (host-mapped `6984`)
  - Persistence: `peer1.manufacturer.pharma.com:/var/hyperledger/production`

### Distributor
- `peer0.distributor.pharma.com`
  - Peer port: `9051`
  - Chaincode port: `9052`
  - Operations port: `9448`
  - Gossip bootstrap: `peer1.distributor.pharma.com:10051`
  - CouchDB: `couchdb0.distributor` at `5984` (host-mapped `7984`)
  - Persistence: `peer0.distributor.pharma.com:/var/hyperledger/production`

- `peer1.distributor.pharma.com`
  - Peer port: `10051`
  - Chaincode port: `10052`
  - Operations port: `9449`
  - Gossip bootstrap: `peer0.distributor.pharma.com:9051`
  - CouchDB: `couchdb1.distributor` at `5984` (host-mapped `8984`)
  - Persistence: `peer1.distributor.pharma.com:/var/hyperledger/production`

### Retailer
- `peer0.retailer.pharma.com`
  - Peer port: `11051`
  - Chaincode port: `11052`
  - Operations port: `9450`
  - Gossip bootstrap: `peer1.retailer.pharma.com:12051`
  - CouchDB: `couchdb0.retailer` at `5984` (host-mapped `9984`)
  - Persistence: `peer0.retailer.pharma.com:/var/hyperledger/production`

- `peer1.retailer.pharma.com`
  - Peer port: `12051`
  - Chaincode port: `12052`
  - Operations port: `9451`
  - Gossip bootstrap: `peer0.retailer.pharma.com:11051`
  - CouchDB: `couchdb1.retailer` at `5984` (host-mapped `10984`)
  - Persistence: `peer1.retailer.pharma.com:/var/hyperledger/production`

---

## Channels and Policies

- **Application Channel**: `supply-chain-channel`
  - Genesis block created directly (Fabric 2.5 style) using profile `PharmaChannel` in `configtx/configtx.yaml`.
  - Capabilities: `Channel: V2_0`, `Orderer: V2_0`, `Application: V2_5`.
  - Organizations: Manufacturer, Distributor, Retailer.
  - Anchor Peers: Set for each org as above.
  - Policies: ImplicitMeta for Readers/Writers/Admins; Application Endorsement policy defaults to `MAJORITY Endorsement`.

### Channel Creation/Join Flow
1. Generate crypto (`cryptogen`) and the channel genesis block (`configtxgen`).
2. Start orderers and peers via Docker Compose.
3. Use `osnadmin channel join` to join all orderers with their admin TLS certs/keys.
4. Use `peer channel join` to join peers (one org at a time via CLI context).

---

## Chaincode

- **Name**: `pharma-supply`
- **Language**: Node.js (Fabric Contract API)
- **Path**: `chaincode/pharma-supply`
- **Key Transactions**:
  - `InitLedger`, `CreateProduct`, `TransferProduct`, `UpdateProductStatus`, `QueryProduct`, `GetAllProducts`, `GetProductHistory`, `MarkCounterfeit`
- **Deployment**:
  - Packaged and installed on all orgs, approved, and committed with peer addresses from all three orgs.
  - Commit command references multiple peer addresses and TLS root certs to collect endorsements and commit via `orderer1`.
- **State**: Stored in CouchDB per peer; rich queries can be leveraged if added later.

---

## TLS, Certificates, and Security

- **TLS**: Enabled for peers (`CORE_PEER_TLS_ENABLED=true`) and orderers (`ORDERER_GENERAL_TLS_ENABLED=true`).
- **Admin TLS**: `ORDERER_ADMIN_TLS_ENABLED=true` for osnadmin API.
- **Root CAs**: Each component mounts TLS CA certs; client CLI uses `$ORDERER_CA` and peer TLS roots for secure communication.
- **Hostnames**: When invoking from host, TLS server host override is set per org (e.g., `CORE_PEER_TLS_SERVERHOSTOVERRIDE=peer0.manufacturer.pharma.com`).
- **Hosts file** (optional for convenience):
  - `127.0.0.1 peer0.manufacturer.pharma.com peer1.manufacturer.pharma.com`
  - `127.0.0.1 peer0.distributor.pharma.com peer1.distributor.pharma.com`
  - `127.0.0.1 peer0.retailer.pharma.com   peer1.retailer.pharma.com`

---

## Container Images, Network, and Persistence

- **Images**: `hyperledger/fabric-orderer:2.5`, `hyperledger/fabric-peer:2.5`, `couchdb:3.3.2`
- **Docker Network**: `fabric_pharma`
- **Volumes**: Named volumes per orderer and per peer for ledger data; bind mounts for MSP/TLS materials and `core.yaml`.
- **Operations & Metrics**:
  - Orderers expose operations port (`9443-9445`) with Prometheus metrics enabled.
  - Peers expose operations port (`9446-9451`) with Prometheus metrics enabled.

---

## Ports Reference

| Component | Hostname | Client Port | Chaincode Port | Admin/OSN | Operations | CouchDB (host→container) |
|---|---|---:|---:|---:|---:|---|
| Orderer | orderer1.pharma.com | 7050 | – | 7053 | 9443 | – |
| Orderer | orderer2.pharma.com | 8050 | – | 8053 | 9444 | – |
| Orderer | orderer3.pharma.com | 9050 | – | 9053 | 9445 | – |
| Peer (Manufacturer) | peer0.manufacturer.pharma.com | 7051 | 7052 | – | 9446 | 5984→5984 |
| Peer (Manufacturer) | peer1.manufacturer.pharma.com | 8051 | 8052 | – | 9447 | 6984→5984 |
| Peer (Distributor) | peer0.distributor.pharma.com | 9051 | 9052 | – | 9448 | 7984→5984 |
| Peer (Distributor) | peer1.distributor.pharma.com | 10051 | 10052 | – | 9449 | 8984→5984 |
| Peer (Retailer) | peer0.retailer.pharma.com | 11051 | 11052 | – | 9450 | 9984→5984 |
| Peer (Retailer) | peer1.retailer.pharma.com | 12051 | 12052 | – | 9451 | 10984→5984 |

---

## CLI and Automation

- **Binaries**: CLI uses `../fabric-samples/bin` for `peer`, `osnadmin`, `configtxgen`, `cryptogen`.
- **Scripts**:
  - `network.sh up` → generates crypto and channel block; starts containers
  - `network.sh createChannel` → joins orderers (osnadmin) and peers to the channel
  - `network.sh deployCC` → lifecycle package/install/approve/commit `pharma-supply`
  - `scripts/testNetwork.sh` → smoke test: create product → transfer → history → list

---

## Data Flow (Example Transaction)

1. Client submits `CreateProduct` to gateway/peer (e.g., Manufacturer).
2. Endorsing peers (across orgs per policy) simulate and endorse the proposal.
3. Client assembles endorsements and submits to an orderer (`orderer1:7050`).
4. Raft orders the transaction; blocks are delivered to all peers on the channel.
5. Peers validate per VSCC and commit to their ledgers/CouchDB state.

---

## Notes and Considerations

- This demo topology favors clarity: 2 peers per org, distinct CouchDBs, and 3 orderers. Scale up/down by changing `Template.Count` and compose services.
- Chaincode currently does not enforce MSP-based access controls; add attribute checks if needed for production.
- Ensure Docker Desktop/engine exposes the mapped ports and the host environment has Bash and the Fabric binaries.
- On Windows, prefer WSL2 for running the Bash scripts.


