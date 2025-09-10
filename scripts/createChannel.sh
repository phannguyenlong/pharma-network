#!/bin/bash
# scripts/createChannel.sh - Create and join channel

export PATH=${PWD}/../fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
. scripts/envVar.sh

CHANNEL_NAME="supply-chain-channel"
DELAY=3
MAX_RETRY=5

createChannel() {
  setGlobals manufacturer
  
  echo "Creating channel ${CHANNEL_NAME}"
  
  peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    -f ./channel-artifacts/${CHANNEL_NAME}.tx \
    --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block \
    --tls --cafile $ORDERER_CA
}

joinChannel() {
  ORG=$1
  setGlobals $ORG
  
  echo "Joining ${ORG} to channel..."
  peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
}

updateAnchorPeers() {
  ORG=$1
  setGlobals $ORG
  
  echo "Updating anchor peers for ${ORG}..."
  peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer1.pharma.com \
    -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx \
    --tls --cafile $ORDERER_CA
}

# Create channel
createChannel

# Join all peers to channel
echo "Joining manufacturer peer0..."
setGlobals manufacturer
peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

echo "Joining distributor peer0..."
setGlobals distributor
peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

echo "Joining retailer peer0..."
setGlobals retailer
peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

# Update anchor peers
updateAnchorPeers manufacturer
updateAnchorPeers distributor
updateAnchorPeers retailer

echo "Channel '$CHANNEL_NAME' created and all peers joined successfully!"