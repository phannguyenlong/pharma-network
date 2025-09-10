# Network structure


```
pharma-network/
├── network.sh                                    # Main control script
├── configtx/
│   └── configtx.yaml                            # Network configuration
├── docker/
│   └── docker-compose-net.yaml                  # Docker containers setup
├── organizations/
│   ├── cryptogen/
│   │   ├── crypto-config-orderer.yaml           # Orderer certificates config
│   │   ├── crypto-config-manufacturer.yaml      # Manufacturer certificates
│   │   ├── crypto-config-distributor.yaml       # Distributor certificates
│   │   └── crypto-config-retailer.yaml          # Retailer certificates
│   └── ccp/
│       ├── ccp-template.yaml                    # Template for connection profiles
│       ├── connection-manufacturer.yaml         # Manufacturer connection profile
│       ├── connection-distributor.yaml          # Distributor connection profile
│       └── connection-retailer.yaml             # Retailer connection profile
├── scripts/
│   ├── envVar.sh                                # Environment variables
│   ├── createChannel.sh                         # Channel creation script
│   ├── deployCC.sh                              # Chaincode deployment script
│   └── ccp-generate.sh                          # Connection profile generator
└── chaincode/
    └── pharma-supply/
        ├── package.json                          # Node.js dependencies
        ├── index.js                              # Chaincode entry point
        └── pharmaSupply.js                       # Main chaincode logic
```