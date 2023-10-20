/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { ChaincodeEvent, CloseableAsyncIterable, connect, Contract, GatewayError, Network } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { newGrpcConnection, newIdentity, newSigner } from './connect';

import fetch, {Headers,Request,Response} from 'node-fetch';

const channelName = 'mychannel';
const chaincodeName = 'events';

const utf8Decoder = new TextDecoder();
const now = Date.now();
const assetId = '01HCZX3EZRQW1XWAM0DYMRW8RE';


async function main(): Promise<void> {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    let events: CloseableAsyncIterable<ChaincodeEvent> | undefined;

    try {
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Listen for events emitted by subsequent transactions
        events = await startEventListening(network);

        // const firstBlockNumber = await createAsset(contract);

        const firstBlockNumber = BigInt(0);

        // await updateAsset(contract);
        // await transferAsset(contract);
        // await deleteAssetByID(contract);

        
        
        await replayChaincodeEvents(network, contract, firstBlockNumber);
    } finally {
        events?.close();
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function startEventListening(network: Network): Promise<CloseableAsyncIterable<ChaincodeEvent>> {
    console.log('\n*** Start chaincode event listening');

    const events = await network.getChaincodeEvents(chaincodeName);

    void readEvents(events); // Don't await - run asynchronously
    return events;
}

async function readEvents(events: CloseableAsyncIterable<ChaincodeEvent>): Promise<void> {
    try {
        for await (const event of events) {
            const payload = parseJson(event.payload);
            console.log(`\n<-- Chaincode event received: ${event.eventName} -`, payload);
        }
    } catch (error: unknown) {
        // Ignore the read error when events.close() is called explicitly
        if (!(error instanceof GatewayError)) {
            throw error;
        }
    }
}

function parseJson(jsonBytes: Uint8Array): unknown {
    const json = utf8Decoder.decode(jsonBytes);
    return JSON.parse(json);
}

// async function createAsset(contract: Contract): Promise<bigint> {
//     console.log(`\n--> Submit Transaction: CreateAsset, ${assetId} owned by Sam with appraised value 100`);



//     // product_id: "01HCZX3EZRQW1XWAM0DYMRW8RE",
//     // supplier_id: "01HCZX3EZRH5J621GD8K2EJJEC",
//     // part_name: "radiator",
//     // shipment_date: new Date(7,3,2024),
//     // expected_shipment_date: new Date("2024-01-15"),
//     // shipment_method_type: "Ship",
//     // longitude: -8.6708785,
//     // latitude: 39.6288756,
//     // quantity: 3,
//     // appraisedValue: 84.7



//     const result = await contract.submitAsync('CreateAsset', {
//         arguments: [ assetId, '01HCZX3EZRH5J621GD8K2EJJEC', 'radiator', '', '', 'Ship', '', '', '', '84.7'  ],
//     });

//     const status = await result.getStatus();
//     if (!status.successful) {
//         throw new Error(`failed to commit transaction ${status.transactionId} with status code ${status.code}`);
//     }

//     console.log('\n*** CreateAsset committed successfully');

//     return status.blockNumber;
// }

// async function updateAsset(contract: Contract): Promise<void> {
//     console.log(`\n--> Submit transaction: UpdateAsset, ${assetId} updated location and expected_shipment_date, shipment_date, and appraisedValue`);

//     await contract.submitTransaction('UpdateAsset', assetId, '01HCZX3EZRH5J621GD8K2EJJEC', 'radiator', 'Ship', '84.7', '2024-07-03', '2024-01-15', '-8.6708785', '39.6288756', '10');

//     console.log('\n*** UpdateAsset committed successfully');
// }

async function updateAsset(contract: Contract): Promise<void> {
    console.log(`\n--> Submit transaction: UpdateAsset, ${assetId} updated location and expected_shipment_date, shipment_date, and appraisedValue`);

    // if(await data.shipment_date > asset.expected_shipment_date){
    //     asset.appraisedValue = asset.appraisedValue*0.95; 
    //     await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
    // }else{
    //     asset.appraisedValue = asset.appraisedValue*1.05;
    //     await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
    // }
    const r = await CallOracle();

    const data = JSON.parse(r);
    
    console.log(`This is data: ${data.shipment_date_str} and the type ${typeof(data.shipment_date_str)}`);

    await contract.submitTransaction('UpdateAsset', assetId, '01HCZX3EZRH5J621GD8K2EJJEC', 'radiator', 'Ship', '84.7', data.shipment_date_str, '', '-8.6708785', '39.6288756', data.quantity);

    console.log('\n*** UpdateAsset committed successfully');
}

// async function transferAsset(contract: Contract): Promise<void> {
//     const quantity = '8';
//     console.log(`\n--> Submit transaction: TransferAsset, ${assetId} quantity to ${quantity}`);

//     await contract.submitTransaction('TransferAsset', assetId, quantity);

//     console.log('\n*** TransferAsset committed successfully');
// }

// async function deleteAssetByID(contract: Contract): Promise<void>{
//     console.log(`\n--> Submit transaction: DeleteAsset, ${assetId}`);

//     await contract.submitTransaction('DeleteAsset', assetId);

//     console.log('\n*** DeleteAsset committed successfully');
// }

async function replayChaincodeEvents(network: Network, contract: Contract, startBlock: bigint): Promise<void> {
    console.log('\n*** Start chaincode event replay');
    
    const events = await network.getChaincodeEvents(chaincodeName, {
        startBlock,
    });

    try {
        for await (const event of events) {
            const payload = parseJson(event.payload);
            console.log(`\n<-- Chaincode event replayed: ${event.eventName} -`, payload);
            if (event.eventName === 'TransferAsset') { 
                // const data = await CallOracle();
                updateAsset(contract);
                
            }
            
            // if (event.eventName === 'DeleteAsset') {
                // Reached the last submitted transaction so break to stop listening for events
                // break;
            // }
        }
    } finally {
        events.close();
    }
}

async function CallOracle(): Promise<any> {
    // const asset = JSON.parse(assetString);
    // const id = asset.product_id;
    const data = {
        "product_id": "01HD5803VTVE9B658506T86CFA",
        "supplier_id": "01HD5803VTD85XT9DNN2116397",
        "part_name": "oil filter",
        "shipment_date": "2023-12-27T02:25:28Z",
        "shipment_method_type": "Ship",
        "part_location": {
          "longitude": "52.9009502",
          "latitude": "36.6454207"
        },
        "quantity": "",
        "apprisedValue": "10.11",
        "shipment_date_str": "2023-11-01",
        "shipment_test": false
      };
    // console.log(`This is the data: ${typeof(new Date(data.shipment_date))} of ${data.shipment_date} *********--------`);
    return JSON.stringify(data);
    try {
        const apiKey = '795eb1c0';
        const response = await fetch('https://my.api.mockaroo.com/supply_chain.json', {
            method: 'POST',
            headers: {
            'X-API-KEY': apiKey
            },
            // body: JSON.stringify({id})
        });
            // .then((response) => response.json())
            // .then(async (data)=>{
                // data
                // asset.shipment_date = data.shipment_date_str;
                // asset.longitude = data.part_location.longitude;
                // asset.latitude = data.part_location.latitude;
                // asset.quantity = quantity;
                // asset.shipment_test = await data.shipment_test;
                // asset.appraisedValue = (new Date(data.shipment_date) > new Date(asset.expected_shipment_date)) ? asset.appraisedValue*0.95 : asset.appraisedValue*1.05;
                // if(await data.shipment_date > asset.expected_shipment_date){
                //     asset.appraisedValue = asset.appraisedValue*0.95; 
                //     await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
                // }else{
                //     asset.appraisedValue = asset.appraisedValue*1.05;
                //     await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
                // }
                // return data;
            // })
        if(!response.ok){
            throw new Error(`Error! status: ${response.status}`)
        }    
        const data = await response.json();
       
        // console.log(`This is the data: ${typeof(new Date(data.shipment_date))} of ${data.shipment_date} *********--------`);
        return data;
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    } 

}
