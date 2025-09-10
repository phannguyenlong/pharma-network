#!/bin/bash
# scripts/createChannel.sh - Create and join channel (FIXED VERSION)

# Set the path for Fabric binaries
export PATH=${PWD}/../fabric-samples/bin:$PATH

# IMPORTANT: Set FABRIC_CFG_PATH to where core.yaml is located
export FABRIC_CFG_PATH=${PWD}/configtx

# Enable TLS
export CORE_PEER_TLS_ENABLED=true

# Source environment variables
. scripts/envVar.sh

CHANNEL_NAME="supply-chain-channel"
DELAY=3
MAX_RETRY=5
VERBOSE=false

# Function to create the channel
createChannel() {
  echo "Setting environment for manufacturer..."
  setGlobals manufacturer
  
  echo "Creating channel ${CHANNEL_NAME}"
  
  set -x
  peer channel create \
    -o localhost:7050 \
    -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    -f ./channel-artifacts/${CHANNEL_NAME}.tx \
    --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block \
    --tls \
    --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
  
  if [ $res -ne 0 ]; then
    echo "Failed to create channel..."
    cat log.txt
    exit 1
  fi
  
  echo "Channel created successfully"
}

# Function to join channel
joinChannel() {
  ORG=$1
  echo "Joining ${ORG} to channel..."
  setGlobals $ORG
  
  set -x
  peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block >&log.txt
  res=$?
  set +x
  
  if [ $res -ne 0 ]; then
    echo "Failed to join ${ORG} to channel..."
    cat log.txt
    exit 1
  fi
  
  echo "${ORG} joined channel successfully"
}

# Function to update anchor peers
updateAnchorPeers() {
  ORG=$1
  echo "Updating anchor peers for ${ORG}..."
  setGlobals $ORG
  
  set -x
  peer channel update \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    -c $CHANNEL_NAME \
    -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx \
    --tls \
    --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
  
  if [ $res -ne 0 ]; then
    echo "Failed to update anchor peers for ${ORG}..."
    cat log.txt
    exit 1
  fi
  
  echo "Anchor peers updated for ${ORG}"
}

# Check if channel artifacts exist
if [ ! -f "./channel-artifacts/${CHANNEL_NAME}.tx" ]; then
  echo "Channel transaction file not found! Run './network.sh up' first"
  exit 1
fi

# Check if core.yaml exists in configtx directory
if [ ! -f "${FABRIC_CFG_PATH}/core.yaml" ]; then
  echo "Warning: core.yaml not found in ${FABRIC_CFG_PATH}"
  echo "Creating core.yaml..."
  # We can use the default peer config
  cp ../fabric-samples/config/core.yaml ${FABRIC_CFG_PATH}/ 2>/dev/null || echo "Using embedded configuration"
fi

echo "============================================="
echo "Creating channel: ${CHANNEL_NAME}"
echo "============================================="

# Create channel
createChannel

echo "============================================="
echo "Joining all organizations to channel"
echo "============================================="

# Join all peers to channel
joinChannel manufacturer
sleep $DELAY

joinChannel distributor
sleep $DELAY

joinChannel retailer
sleep $DELAY

echo "============================================="
echo "Updating anchor peers"
echo "============================================="

# Update anchor peers for all organizations
updateAnchorPeers manufacturer
sleep $DELAY

updateAnchorPeers distributor
sleep $DELAY

updateAnchorPeers retailer
sleep $DELAY

echo "============================================="
echo "Channel '${CHANNEL_NAME}' setup completed!"
echo "============================================="

# Verify channel creation
echo "Verifying channel creation..."
setGlobals manufacturer
peer channel list

exit 0