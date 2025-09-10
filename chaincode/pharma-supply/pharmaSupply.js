// chaincode/pharma-supply/pharmaSupply.js
'use strict';

const { Contract } = require('fabric-contract-api');

class PharmaSupplyContract extends Contract {
    
    // Convert Fabric transaction timestamp to ISO string deterministically across peers
    getTxTimestampISO(ctx) {
        const ts = ctx.stub.getTxTimestamp();
        try {
            const seconds = typeof ts.seconds === 'number' ? ts.seconds : (ts.seconds.low !== undefined ? ts.seconds.low : (ts.seconds.toInt ? ts.seconds.toInt() : parseInt(ts.seconds)));
            const millis = seconds * 1000 + Math.floor((ts.nanos || 0) / 1e6);
            return new Date(millis).toISOString();
        } catch (e) {
            // Fallback in unlikely case of parsing issues
            return new Date(0).toISOString();
        }
    }
    
    // Get Fabric transaction timestamp as Date object
    getTxDate(ctx) {
        const ts = ctx.stub.getTxTimestamp();
        try {
            const seconds = typeof ts.seconds === 'number' ? ts.seconds : (ts.seconds.low !== undefined ? ts.seconds.low : (ts.seconds.toInt ? ts.seconds.toInt() : parseInt(ts.seconds)));
            const millis = seconds * 1000 + Math.floor((ts.nanos || 0) / 1e6);
            return new Date(millis);
        } catch (e) {
            return new Date(0);
        }
    }
    
    async InitLedger(ctx) {
        console.log('Initializing pharmaceutical supply chain ledger');
        
        const products = [
            {
                productId: 'DRUG001',
                name: 'Aspirin',
                manufacturer: 'PharmaCorp',
                batchNumber: 'BATCH001',
                manufactureDate: '2024-01-01',
                expiryDate: '2026-01-01',
                owner: 'manufacturer',
                status: 'manufactured',
                location: 'Warehouse-A',
                temperature: '20C',
                verified: true
            },
            {
                productId: 'DRUG002',
                name: 'Paracetamol',
                manufacturer: 'PharmaCorp',
                batchNumber: 'BATCH002',
                manufactureDate: '2024-01-02',
                expiryDate: '2026-01-02',
                owner: 'manufacturer',
                status: 'manufactured',
                location: 'Warehouse-A',
                temperature: '20C',
                verified: true
            }
        ];
        
        for (const product of products) {
            await ctx.stub.putState(product.productId, Buffer.from(JSON.stringify(product)));
            console.log(`Added product: ${product.productId}`);
        }
        
        return 'Ledger initialized with sample products';
    }
    
    // Create a new pharmaceutical product
    async CreateProduct(ctx, productId, name, manufacturer, batchNumber, manufactureDate, expiryDate) {
        const product = {
            productId: productId,
            name: name,
            manufacturer: manufacturer,
            batchNumber: batchNumber,
            manufactureDate: manufactureDate,
            expiryDate: expiryDate,
            owner: 'manufacturer',
            status: 'manufactured',
            location: 'Manufacturing Facility',
            temperature: '20C',
            verified: true,
            timestamp: this.getTxTimestampISO(ctx)
        };
        
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }
    
    // Transfer product ownership
    async TransferProduct(ctx, productId, newOwner, location) {
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        
        const product = JSON.parse(productBytes.toString());
        
        // Verify product before transfer
        if (!this.verifyProduct(ctx, product)) {
            throw new Error(`Product ${productId} verification failed`);
        }
        
        product.owner = newOwner;
        product.location = location;
        product.lastTransfer = this.getTxTimestampISO(ctx);
        
        // Update status based on new owner
        if (newOwner === 'distributor') {
            product.status = 'in-distribution';
        } else if (newOwner === 'retailer') {
            product.status = 'at-retailer';
        } else if (newOwner === 'customer') {
            product.status = 'sold';
        }
        
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }
    
    // Query product by ID
    async QueryProduct(ctx, productId) {
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        return productBytes.toString();
    }
    
    // Update product status
    async UpdateProductStatus(ctx, productId, status, temperature) {
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        
        const product = JSON.parse(productBytes.toString());
        product.status = status;
        product.temperature = temperature;
        product.lastUpdate = this.getTxTimestampISO(ctx);
        
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }
    
    // Get all products
    async GetAllProducts(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    
    // Get product history
    async GetProductHistory(ctx, productId) {
        const iterator = await ctx.stub.getHistoryForKey(productId);
        const allResults = [];
        
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                record: record
            });
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
    
    // Verify product authenticity (simplified)
    verifyProduct(ctx, product) {
        // Check if product has required fields
        if (!product.productId || !product.manufacturer || !product.batchNumber) {
            return false;
        }
        
        // Check if product is not expired
        const expiryDate = new Date(product.expiryDate);
        const txDate = this.getTxDate(ctx);
        if (expiryDate < txDate) {
            return false;
        }
        
        // Check if product is verified
        if (!product.verified) {
            return false;
        }
        
        return true;
    }
    
    // Mark product as counterfeit (for testing attacks)
    async MarkCounterfeit(ctx, productId) {
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        
        const product = JSON.parse(productBytes.toString());
        product.verified = false;
        product.status = 'COUNTERFEIT';
        product.alertRaised = this.getTxTimestampISO(ctx);
        
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }
}

module.exports = PharmaSupplyContract;