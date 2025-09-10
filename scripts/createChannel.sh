#!/bin/bash
# scripts/createChannel.sh - Create and join channel for Fabric 2.5

# Set the path for Fabric binaries
export PATH=${PWD}/../fabric-samples/bin:$PATH

# Use fabric-samples config if available, otherwise use local
if [ -d "../fabric-samples/config" ]; then
  export FABRIC_CFG_PATH=${PWD}/../fabric-samples/config
else
  export FABRIC_CFG_PATH=${PWD}/configtx
fi

# Enable TLS
export CORE_PEER_TLS_ENABLED=true

# Source environment variables
. scripts/envVar.sh

CHANNEL_NAME="supply-chain-channel"
DELAY=3
MAX_RETRY=5
VERBOSE=false

# Function to join the orderers to the channel (Fabric 2.5 requirement)
function joinOrdererToChannel() {
  echo "Joining orderers to channel ${CHANNEL_NAME}..."
  
  # Join orderer1
  echo "Joining orderer1 to channel..."
  osnadmin channel join \
    --channelID ${CHANNEL_NAME} \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block \
    -o localhost:7053 \
    --ca-file ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem \
    --client-cert ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.crt \
    --client-key ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.key
  
  # Join orderer2
  echo "Joining orderer2 to channel..."
  osnadmin channel join \
    --channelID ${CHANNEL_NAME} \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block \
    -o localhost:8053 \
    --ca-file ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem \
    --client-cert ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.crt \
    --client-key ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.key
  
  # Join orderer3
  echo "Joining orderer3 to channel..."
  osnadmin channel join \
    --channelID ${CHANNEL_NAME} \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block \
    -o localhost:9053 \
    --ca-file ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem \
    --client-cert ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.crt \
    --client-key ${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.key
  
  echo "All orderers joined to channel successfully"
}

# Function to join peer to channel
function joinChannel() {
  ORG=$1
  echo "Joining ${ORG} to channel..."
  setGlobals $ORG
  
  local counter=1
  local delay=3
  
  while [ $counter -le 5 ]; do
    set -x
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
    
    if [ $res -eq 0 ]; then
      echo "${ORG} joined channel successfully"
      break
    else
      echo "Failed to join ${ORG} to channel, Retry after $delay seconds..."
      sleep $delay
      counter=$(($counter + 1))
    fi
  done
  
  if [ $counter -gt 5 ]; then
    echo "Failed to join ${ORG} to channel after multiple attempts"
    cat log.txt
    exit 1
  fi
}

# Check if genesis block exists
if [ ! -f "./channel-artifacts/${CHANNEL_NAME}.block" ]; then
  echo "Channel genesis block not found! Run './network.sh up' first"
  exit 1
fi

echo "============================================="
echo "Joining channel: ${CHANNEL_NAME}"
echo "============================================="

# First, join all orderers to the channel (Fabric 2.5 requirement)
joinOrdererToChannel

# Wait for orderers to be ready
echo "Waiting for orderers to be ready..."
sleep 5

echo "============================================="
echo "Joining all peers to channel"
echo "============================================="

# Join all peers to channel
joinChannel manufacturer
sleep $DELAY

joinChannel distributor
sleep $DELAY

joinChannel retailer
sleep $DELAY

echo "============================================="
echo "Channel '${CHANNEL_NAME}' setup completed!"
echo "============================================="

# List channels for verification
echo "Verifying channel creation..."
setGlobals manufacturer
peer channel list

echo ""
echo "Channel is ready. You can now deploy chaincode with:"
echo "  ./network.sh deployCC"

exit 0