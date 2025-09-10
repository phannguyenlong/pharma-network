#!/bin/bash
# scripts/envVar.sh - Environment variables setup

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
export PEER0_MANUFACTURER_CA=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export PEER0_DISTRIBUTOR_CA=${PWD}/organizations/peerOrganizations/distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt
export PEER0_RETAILER_CA=${PWD}/organizations/peerOrganizations/retailer.pharma.com/peers/peer0.retailer.pharma.com/tls/ca.crt
export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.key

# Set environment for specific organization
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  echo "Using organization ${USING_ORG}"
  
  if [ $USING_ORG = "manufacturer" ]; then
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/users/Admin@manufacturer.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    export CORE_PEER_TLS_SERVERHOSTOVERRIDE=peer0.manufacturer.pharma.com
  elif [ $USING_ORG = "distributor" ]; then
    export CORE_PEER_LOCALMSPID="DistributorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DISTRIBUTOR_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/distributor.pharma.com/users/Admin@distributor.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    export CORE_PEER_TLS_SERVERHOSTOVERRIDE=peer0.distributor.pharma.com
  elif [ $USING_ORG = "retailer" ]; then
    export CORE_PEER_LOCALMSPID="RetailerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_RETAILER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/retailer.pharma.com/users/Admin@retailer.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
    export CORE_PEER_TLS_SERVERHOSTOVERRIDE=peer0.retailer.pharma.com
  else
    echo "Unknown organization: $USING_ORG"
    exit 1
  fi
}