#!/bin/bash
# scripts/seedMockData.sh - Seed mock data across different product states
set -euo pipefail

# Binaries on PATH
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

invoke_as() {
  local org=$1
  local args_json=$2
  setGlobals ${org}
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

query_tx() {
  local args_json=$1
  setGlobals manufacturer
  peer chaincode query -C ${CHANNEL_NAME} -n ${CC_NAME} -c "${args_json}" || true
}

create_product() {
  local id=$1 name=$2 mfr=$3 batch=$4 mdate=$5 edate=$6
  header "CreateProduct ${id} (manufacturer)"
  invoke_as manufacturer '{"Args":["CreateProduct","'"'${id}'"'","'"'${name}'"'","'"'${mfr}'"'","'"'${batch}'"'","'"'${mdate}'"'","'"'${edate}'"'"]}'
}

update_status_as() {
  local org=$1 id=$2 status=$3 temp=$4
  header "UpdateProductStatus ${id} -> ${status} (${temp}) by ${org}"
  invoke_as ${org} '{"Args":["UpdateProductStatus","'"'${id}'"'","'"'${status}'"'","'"'${temp}'"'"]}'
}

transfer_to_as() {
  local org=$1 id=$2 owner=$3 location=$4
  header "TransferProduct ${id} -> ${owner} @ ${location} by ${org}"
  invoke_as ${org} '{"Args":["TransferProduct","'"'${id}'"'","'"'${owner}'"'","'"'${location}'"'"]}'
}

mark_counterfeit_as() {
  local org=$1 id=$2
  header "MarkCounterfeit ${id} by ${org}"
  invoke_as ${org} '{"Args":["MarkCounterfeit","'"'${id}'"'"]}'
}

main() {
  # Manufactured only (at manufacturer)
  create_product DRUG301 "Atorvastatin" "PharmaCorp-A" "BATCH301" "2025-02-01" "2027-02-01"

  # Multi-leg cold-chain: manufacturer -> distributor -> retailer -> customer
  create_product DRUG302 "Metformin" "PharmaCorp-B" "BATCH302" "2025-03-01" "2027-03-01"
  update_status_as manufacturer DRUG302 "ready-for-shipment" "20C"
  transfer_to_as manufacturer DRUG302 distributor "Distribution Hub-1"
  update_status_as distributor DRUG302 "in-transit" "18C"
  transfer_to_as distributor DRUG302 retailer "Retail Store-1"
  update_status_as retailer DRUG302 "at-retailer" "22C"
  transfer_to_as retailer DRUG302 customer "Customer Address"

  # At retailer, awaiting sale
  create_product DRUG303 "Lisinopril" "PharmaCorp-C" "BATCH303" "2025-04-01" "2027-04-01"
  transfer_to_as manufacturer DRUG303 distributor "Distribution Hub-2"
  update_status_as distributor DRUG303 "in-transit" "19C"
  transfer_to_as distributor DRUG303 retailer "Retail Store-5"
  update_status_as retailer DRUG303 "at-retailer" "21C"

  # Counterfeit flagged by distributor
  create_product DRUG304 "Amoxicillin" "PharmaCorp-D" "BATCH304" "2025-05-01" "2027-05-01"
  transfer_to_as manufacturer DRUG304 distributor "Distribution Hub-3"
  mark_counterfeit_as distributor DRUG304

  # Near expiry, in distribution (held at distributor)
  create_product DRUG305 "Clopidogrel" "PharmaCorp-E" "BATCH305" "2024-10-01" "2025-12-31"
  transfer_to_as manufacturer DRUG305 distributor "Distribution Hub-4"
  update_status_as distributor DRUG305 "in-transit" "17C"

  header "All products"
  query_tx '{"Args":["GetAllProducts"]}'
}

main "$@"


