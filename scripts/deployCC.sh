#!/bin/bash
# scripts/deployCC.sh - Deploy chaincode

export PATH=${PWD}/../fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
. scripts/envVar.sh

CHANNEL_NAME="supply-chain-channel"
CC_NAME="pharma-supply"
CC_SRC_PATH="./chaincode/pharma-supply"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_INIT_FCN="InitLedger"
CC_INVOKE_FCN="CreateProduct"

packageChaincode() {
  echo "Packaging chaincode..."
  peer lifecycle chaincode package ${CC_NAME}.tar.gz \
    --path ${CC_SRC_PATH} \
    --lang node \
    --label ${CC_NAME}_${CC_VERSION}
}

installChaincode() {
  ORG=$1
  setGlobals $ORG
  
  echo "Installing chaincode on ${ORG}..."
  peer lifecycle chaincode install ${CC_NAME}.tar.gz
}

approveForMyOrg() {
  ORG=$1
  setGlobals $ORG
  
  echo "Approving chaincode for ${ORG}..."
  
  # Get package ID
  peer lifecycle chaincode queryinstalled >&log.txt
  PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
  
  peer lifecycle chaincode approveformyorg -o localhost:7050 \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls --cafile $ORDERER_CA
}

commitChaincode() {
  echo "Committing chaincode..."
  
  peer lifecycle chaincode commit -o localhost:7050 \
    --ordererTLSHostnameOverride orderer1.pharma.com \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls --cafile $ORDERER_CA \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTOR_CA \
    --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_RETAILER_CA
}

# Package chaincode
packageChaincode

# Install on all organizations
installChaincode manufacturer
installChaincode distributor
installChaincode retailer

# Approve for all organizations
approveForMyOrg manufacturer
approveForMyOrg distributor
approveForMyOrg retailer

# Check commit readiness
echo "Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --tls --cafile $ORDERER_CA \
  --output json

# Commit chaincode
commitChaincode

echo "Chaincode deployed successfully!"