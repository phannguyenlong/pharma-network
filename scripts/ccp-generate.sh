#!/bin/bash
# scripts/ccp-generate.sh - Generate connection profiles

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function yaml_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./organizations/ccp/ccp-template.yaml
}

# Generate connection profile for manufacturer
ORG="manufacturer"
P0PORT=7051
P1PORT=8051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/manufacturer.pharma.com/tlsca/tlsca.manufacturer.pharma.com-cert.pem
CAPEM=organizations/peerOrganizations/manufacturer.pharma.com/ca/ca.manufacturer.pharma.com-cert.pem

yaml_ccp $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM > organizations/ccp/connection-manufacturer.yaml

# Generate for distributor
ORG="distributor"
P0PORT=9051
P1PORT=10051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/distributor.pharma.com/tlsca/tlsca.distributor.pharma.com-cert.pem
CAPEM=organizations/peerOrganizations/distributor.pharma.com/ca/ca.distributor.pharma.com-cert.pem

yaml_ccp $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM > organizations/ccp/connection-distributor.yaml

# Generate for retailer
ORG="retailer"
P0PORT=11051
P1PORT=12051
CAPORT=9054
PEERPEM=organizations/peerOrganizations/retailer.pharma.com/tlsca/tlsca.retailer.pharma.com-cert.pem
CAPEM=organizations/peerOrganizations/retailer.pharma.com/ca/ca.retailer.pharma.com-cert.pem

yaml_ccp $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM > organizations/ccp/connection-retailer.yaml



# other version

# #!/bin/bash
# # scripts/ccp-generate.sh - Generate connection profiles

# echo "Generating connection profiles for organizations..."

# # Since cryptogen doesn't generate CA certificates, we'll create static connection profiles
# # These profiles will be used for client applications to connect to the network

# echo "Connection profiles have been pre-created in organizations/ccp/"
# echo "- connection-manufacturer.yaml"
# echo "- connection-distributor.yaml" 
# echo "- connection-retailer.yaml"