#!/bin/bash

# Main network control script for pharmaceutical supply chain - FIXED for Fabric 2.5

export PATH=${PWD}/../fabric-samples/bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
export VERBOSE=false

# Print help
function printHelp() {
  echo "Usage: "
  echo "  network.sh <Mode> [Flags]"
  echo "    <Mode>"
  echo "      - 'up' - Bring up Fabric network with docker containers"
  echo "      - 'down' - Bring down the network and cleanup"
  echo "      - 'restart' - Restart the network"
  echo "      - 'createChannel' - Create and join channel"
  echo "      - 'deployCC' - Deploy chaincode"
  echo
  echo "    Examples:"
  echo "      network.sh up"
  echo "      network.sh down"
  echo "      network.sh createChannel"
  echo "      network.sh deployCC"
}

# Create organizations using cryptogen
function createOrgs() {
  echo "Creating Organization certificates using cryptogen..."
  
  # Create crypto material for orderer
  cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
  
  # Create crypto material for manufacturer
  cryptogen generate --config=./organizations/cryptogen/crypto-config-manufacturer.yaml --output="organizations"
  
  # Create crypto material for distributor
  cryptogen generate --config=./organizations/cryptogen/crypto-config-distributor.yaml --output="organizations"
  
  # Create crypto material for retailer
  cryptogen generate --config=./organizations/cryptogen/crypto-config-retailer.yaml --output="organizations"
  
  echo "Certificate generation complete"
}

# Generate genesis block and channel configuration - UPDATED FOR 2.5
function createConsortium() {
  echo "Generating channel genesis block for Fabric 2.5"
  
  # For Fabric 2.5, we create the genesis block directly for the application channel
  # No system channel is needed
  
  mkdir -p channel-artifacts
  
  echo "Generating channel genesis block 'supply-chain-channel.block'"
  
  configtxgen -profile PharmaChannel -outputBlock ./channel-artifacts/supply-chain-channel.block -channelID supply-chain-channel
  
  echo "Channel genesis block generated successfully"
}

# Bring up the network using docker compose
function networkUp() {
  # Create necessary directories
  mkdir -p organizations channel-artifacts
  
  # Generate certificates
  createOrgs
  
  # Generate channel genesis block
  createConsortium
  
  # Bring up docker containers
  docker-compose -f ./docker/docker-compose-net.yaml up -d
  
  echo "Network is up!"
  echo "Waiting for containers to be ready..."
  sleep 5
  
  echo "Run './network.sh createChannel' to create and join channel"
}

# Bring down the network
function networkDown() {
  echo "Bringing down the network..."
  
  docker-compose -f ./docker/docker-compose-net.yaml down --volumes --remove-orphans
  
  # Cleanup generated files
  rm -rf organizations/ordererOrganizations
  rm -rf organizations/peerOrganizations
  rm -rf channel-artifacts
  rm -rf channel-artifacts/*.block
  rm -rf pharma-supply.tar.gz # delete chaincode package if exists
  
  echo "Network is down!"
}

# Restart the network
function networkRestart() {
  networkDown
  networkUp
}

# Parse mode
MODE=$1
shift

if [[ "${MODE}" == "up" ]]; then
  networkUp
elif [[ "${MODE}" == "down" ]]; then
  networkDown
elif [[ "${MODE}" == "restart" ]]; then
  networkRestart
elif [[ "${MODE}" == "createChannel" ]]; then
  ./scripts/createChannel.sh
elif [[ "${MODE}" == "deployCC" ]]; then
  ./scripts/deployCC.sh
else
  printHelp
  exit 1
fi