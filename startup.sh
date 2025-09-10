#!/bin/bash

# start the network
./network.sh up

# create the channel
./network.sh createChannel

# restart 
docker-compose -f ./docker/docker-compose-net.yaml restart orderer1.pharma.com orderer2.pharma.com orderer3.pharma.com

# add the host entries (if not already added)
# cat >> /etc/hosts <<'EOF'
# 127.0.0.1 peer0.manufacturer.pharma.com
# 127.0.0.1 peer0.distributor.pharma.com
# 127.0.0.1 peer0.retailer.pharma.com
# EOF

# check it 
osnadmin channel list -o localhost:7053 \
  --ca-file organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem \
  --client-cert organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.crt \
  --client-key organizations/ordererOrganizations/pharma.com/orderers/orderer1.pharma.com/tls/server.key


# deploy the chaincode
./network.sh deployCC