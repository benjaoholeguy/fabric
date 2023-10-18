/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset} from './asset';

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                product_id: "01HCZX3EZRQW1XWAM0DYMRW8RE",
                supplier_id: "01HCZX3EZRH5J621GD8K2EJJEC",
                part_name: "radiator",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-01-15",
                shipment_method_type: "Ship",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 84.7
            },
            {
                product_id: "01HCZXSSW4N1268V7GMYYV46TS",
                supplier_id: "01HCZXSSW41229MJG7NCQAS43V",
                part_name: "starter motor",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-08-25",
                shipment_method_type: "Ship",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 29.22
            },
            {
                product_id: "01HCZXSSV9HZNB2F5Q1DEGTJ1W",
                supplier_id: "01HCZXSSVAWH4ZSYYYXGR9XB3Y",
                part_name: "exhaust manifold",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-08-30",
                shipment_method_type: "Plane",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 55.0
            },
            {
                product_id: "01HCZX3EZRQW1XWAM0DYMRW8RE",
                supplier_id: "01HCZX3EZRH5J621GD8K2EJJEC",
                part_name: "radiator",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2023-12-25",
                shipment_method_type: "Ship",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 84.7
            },
            {
                product_id: "01HCZXSSW8NSEEEWHT8H129XZM",
                supplier_id: "01HCZXSSW90GQE3RAH91DVYVW0",
                part_name: "shock absorber",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-08-14",
                shipment_method_type: "Ship",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 53.97
            },
            {
                product_id: "01HCZXSSWAR70S2N1GHNFZ2EEP",
                supplier_id: "01HCZXSSWBB79CGWDSTR7HF4C5",
                part_name: "serpentine belt",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-09-19",
                shipment_method_type: "Plane",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 15.99
            },
            {
                product_id: "01HCZXSSWCWX8RY0M7XVGDKSR1",
                supplier_id: "01HCZXSSWCYG669G59THR0QWP0",
                part_name: "air filter",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-09-19",
                shipment_method_type: "Truck",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 66.46
            },
            {
                product_id: "01HCZXSSWJABQ6MW32SN8CZF2X",
                supplier_id: "01HCZXSSWKJ0VG4D0AWW3AF52B",
                part_name: "air filter",
                // shipment_date: new Date(7,3,2024),
                expected_shipment_date: "2024-07-30",
                shipment_method_type: "Ship",
                // longitude: -8.6708785,
                // latitude: 39.6288756,
                // quantity: 3,
                appraisedValue: 22.94
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieproduct_idg data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.product_id} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, product_id: string, supplier_id: string, part_name: string, shipment_method_type: string, appraisedValue: number, shipment_date?: string, expected_shipment_date?: string, longitude?: number, latitude?: number, quantity?: number): Promise<void> {
        const exists = await this.AssetExists(ctx, product_id);
        if (exists) {
            throw new Error(`The asset ${product_id} already exists`);
        }

        const asset = {
            product_id: product_id,
            supplier_id: supplier_id,
            part_name: part_name,
            shipment_date: (shipment_date != undefined) ? shipment_date : undefined,
            expected_shipment_date: expected_shipment_date,
            shipment_method_type: shipment_method_type,
            longitude: (longitude != undefined) ? longitude : undefined,
            latitude: (latitude != undefined) ? latitude : undefined,
            quantity: (quantity != undefined) ? quantity : undefined,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // Check accident data for a particular vehicle
    // @Transaction()
    // private async GetInfoOracle(id: string): Promise<number> {

    //     const apiKey = '795eb1c0';

    //     const request = async (id: string): Promise<Response> => {
    //         const response = await fetch('https://my.api.mockaroo.com/accident.json', {
    //             method: 'POST',
    //             headers: {
    //             'X-API-KEY': apiKey
    //             },
    //             body: JSON.stringify({id})
    //         });

    //         return response;
    //     };

    //     const response = await request(id);
    //     console.log(response.body);
    //     const jsonData = await response.json();

        

    //     return await jsonData.accident;
                
    //     // if(id=="JH4CL95847C421699"){
    //     //     return 5;
    //     // }
    //     // return 0;
    // }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, product_id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(product_id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${product_id} does not exist`);
        }

        const assetString = assetJSON.toString()
        return assetString;
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, product_id: string, supplier_id: string, part_name: string, shipment_method_type: string, appraisedValue: number, shipment_date?: string, expected_shipment_date?: string, longitude?: number, latitude?: number, quantity?: number): Promise<void> {
        const exists = await this.AssetExists(ctx, product_id);
        if (!exists) {
            throw new Error(`The asset ${product_id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            product_id: product_id,
            supplier_id: supplier_id,
            part_name: part_name,
            shipment_date: (shipment_date != undefined) ? shipment_date : undefined,
            expected_shipment_date: expected_shipment_date,
            shipment_method_type: shipment_method_type,
            longitude: (longitude != undefined) ? longitude : undefined,
            latitude: (latitude != undefined) ? latitude : undefined,
            quantity: (quantity != undefined) ? quantity : undefined,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(product_id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, product_id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, product_id);
        if (!exists) {
            throw new Error(`The asset ${product_id} does not exist`);
        }
        return ctx.stub.deleteState(product_id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, product_id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(product_id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, product_id: string, quantity: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, product_id);
        const asset = JSON.parse(assetString);
        const done = await this.CallOracle(ctx, assetString, quantity)
                        .then(async (asset)=>{
                            if (asset){
                                return asset
                            }
                        });
        if(done){
            return "ok";
        }
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
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

    @Transaction(false)
    @Returns('string')
    public async CallOracle(ctx: Context, assetString: string, quantity: string): Promise<any> {
        const asset = JSON.parse(assetString);
        const id = asset.product_id;

        try {
            const apiKey = '795eb1c0';
            const request = async (id: string): Promise<Response> => {
                const response = await fetch('https://my.api.mockaroo.com/supply_chain.json', {
                    method: 'POST',
                    headers: {
                    'X-API-KEY': apiKey
                    },
                    // body: JSON.stringify({id})
                })
                .then((response) => response.json())
                .then(async (data)=>{
                    asset.shipment_date = data.shipment_date_str;
                    // asset.longitude = data.part_location.longitude;
                    // asset.latitude = data.part_location.latitude;
                    asset.quantity = quantity;
                    asset.appraisedValue = (new Date(data.shipment_date) > new Date(asset.expected_shipment_date)) ? asset.appraisedValue*0.95 : asset.appraisedValue*1.05;
                    await ctx.stub.putState(asset.product_id, Buffer.from(stringify(sortKeysRecursive(asset))));
                    return data;
                })
                return response;
            };
            const response = await request(asset.product_id);
        } catch (error) {
            console.log('*** Successfully caught the error: \n', error);
        } finally {
            return true;
        }


    }

}
