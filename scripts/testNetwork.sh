#!/bin/bash
# scripts/testNetwork.sh - Smoke tests for network and chaincode
set -euo pipefail

# Binaries
export PATH=${PWD}/../fabric-samples/bin:$PATH

# Config path (prefer fabric-samples if present)
if [ -d "../fabric-samples/config" ]; then
  export FABRIC_CFG_PATH=${PWD}/../fabric-samples/config
else
  export FABRIC_CFG_PATH=${PWD}/configtx
fi

. scripts/envVar.sh

CHANNEL_NAME="supply-chain-channel"
CC_NAME="pharma-supply"

header() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

list_system() {
  header "Docker containers (Hyperledger Fabric)"
  docker ps --filter "label=service=hyperledger-fabric" \
    --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

  header "Docker Compose services"
  docker-compose -f ./docker/docker-compose-net.yaml ps

  header "Orderer channel participation"
  # Admin endpoints and per-orderer admin client certs/keys
  declare -a ORDERERS=(
    "orderer1.pharma.com 7053 organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.crt organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.key"
    "orderer2.pharma.com 8053 organizations/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.crt organizations/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.key"
    "orderer3.pharma.com 9053 organizations/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.crt organizations/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.key"
  )
  CA_FILE="organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem"
  for entry in "${ORDERERS[@]}"; do
    read -r ORD_HOST ORD_PORT ORD_CERT ORD_KEY <<<"$entry"
    echo "-- ${ORD_HOST} --"
    osnadmin channel list \
      -o localhost:${ORD_PORT} \
      --ca-file ${CA_FILE} \
      --client-cert ${ORD_CERT} \
      --client-key ${ORD_KEY} || true
    echo ""
  done
}

peer_status() {
  ORG=$1
  header "Peer status: ${ORG}"
  setGlobals ${ORG}
  echo "- Channels for ${ORG}:"
  peer channel list || true
  echo "- Channel height (${CHANNEL_NAME}) for ${ORG}:"
  peer channel getinfo -c ${CHANNEL_NAME} || true
  echo "- Chaincode committed on ${CHANNEL_NAME}:"
  peer lifecycle chaincode querycommitted -C ${CHANNEL_NAME} || true
}

invoke_tx() {
  local args_json=$1
  header "Invoke: ${args_json}"
  setGlobals manufacturer
  unset CORE_PEER_TLS_SERVERHOSTOVERRIDE || true
  peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    -C ${CHANNEL_NAME} -n ${CC_NAME} \
    --tls --cafile ${ORDERER_CA} --waitForEvent \
    --peerAddresses peer0.manufacturer.pharma.com:7051 --tlsRootCertFiles ${PEER0_MANUFACTURER_CA} \
    --peerAddresses peer0.distributor.pharma.com:9051 --tlsRootCertFiles ${PEER0_DISTRIBUTOR_CA} \
    --peerAddresses peer0.retailer.pharma.com:11051 --tlsRootCertFiles ${PEER0_RETAILER_CA} \
    -c "${args_json}"
}

query_fn() {
  local args_json=$1
  header "Query: ${args_json}"
  setGlobals manufacturer
  peer chaincode query -C ${CHANNEL_NAME} -n ${CC_NAME} -c "${args_json}" || true
}

main() {
  list_system

  peer_status manufacturer
  peer_status distributor
  peer_status retailer

  # Test sequence
  PRODUCT_ID="DRUG100"

  # 1) Add product
  invoke_tx '{"Args":["CreateProduct","'"${PRODUCT_ID}"'","Amlodipine","PharmaCorp-X","BATCH100","2025-01-01","2027-01-01"]}'

  # 2) Query product
  query_fn '{"Args":["QueryProduct","'"${PRODUCT_ID}"'"]}'

  # 3) Update status and temperature
  invoke_tx '{"Args":["UpdateProductStatus","'"${PRODUCT_ID}"'","in-transit","18C"]}'

  # 4) Transfer: manufacturer -> distributor
  invoke_tx '{"Args":["TransferProduct","'"${PRODUCT_ID}"'","distributor","Distribution Center-A"]}'

  # 5) Transfer: distributor -> retailer
  invoke_tx '{"Args":["TransferProduct","'"${PRODUCT_ID}"'","retailer","Retail Store-1"]}'

  # 6) Transfer: retailer -> customer
  invoke_tx '{"Args":["TransferProduct","'"${PRODUCT_ID}"'","customer","Customer Location"]}'

  # 7) Get history
  query_fn '{"Args":["GetProductHistory","'"${PRODUCT_ID}"'"]}'

  # 8) List all products
  query_fn '{"Args":["GetAllProducts"]}'
}

main "$@"


