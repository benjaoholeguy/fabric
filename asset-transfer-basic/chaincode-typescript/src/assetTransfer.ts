/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset} from './asset';
// import { TextEncoder } from 'util';

// import {Oracle} from '../../application-oracle/src/application-oracle';
// import {Oracle} from './application-oracle';


@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                VIN: "3D7JB1EP5BG913769",
                Make: "Kia",
                Model: "Rio",
                Year: 2008,
                Owner: "Rice and Sons",
                AppraisedValue: 488685,
                Accident: 3
            },
            {
                VIN: "KNDJT2A50C7413856",
                Make: "Dodge",
                Model: "Dakota Club",
                Year: 1993,
                Owner: "Larson-Marquardt",
                AppraisedValue: 150607,
            },
            {
                VIN: "WVWBN7AN8FE740047",
                Make: "Pontiac",
                Model: "Aztek",
                Year: 2002,
                Owner: "Bailey and Sons",
                AppraisedValue: 469869,
            },
            {
                // ID: 'asset1',
                VIN: 'WP0AA2A94FS067403',
                Make: 'Chrysler',
                Model: 'Sebring',
                Year: 1998,
                Owner:"Rosenbaum-Cormier",
                AppraisedValue: 499375,
            },
            {
                // ID: 'asset2',
                VIN: '5NPDH4AE3DH363638',
                Make: 'Toyota',
                Model: 'Previa',
                Year: 1992,
                Owner:"Hudson Group",
                AppraisedValue: 284879,
            },
            {
                // ID: 'asset3',
                VIN: 'WAUBGBFC6CN394884',
                Make: 'Buick',
                Model: 'Enclave',
                Year: 2009,
                Owner:"Lind Group",
                AppraisedValue: 352389,
            },
            {
                // ID: 'asset4',
                VIN: '1N6AD0CU6CN312965',
                Make: 'Pontiac',
                Model: 'Grand Prix',
                Year: 1990,
                Owner:"Koepp Group",
                AppraisedValue: 450676,
                Accident: 3
            },
            {
                // ID: 'asset5',
                VIN: 'WAUBC48H45K784418',
                Make: 'Nissan',
                Model: 'Xterra',
                Year: 2005,
                Owner:"Wunsch-Kihn",
                AppraisedValue: 307097,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.VIN, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.VIN} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, vin: string, make: string, model: string, year: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.AssetExists(ctx, vin);
        if (exists) {
            throw new Error(`The asset ${vin} already exists`);
        }

        const asset = {
            VIN: vin,
            Make: make,
            Model: model,
            Year: year,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(vin, Buffer.from(stringify(sortKeysRecursive(asset))));
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
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const assetString = assetJSON.toString()
        return assetString;
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, vin: string, make: string, model: string, year: number, owner: string, appraisedValue: number, accident?: number): Promise<void> {
        const exists = await this.AssetExists(ctx, vin);
        if (!exists) {
            throw new Error(`The asset ${vin} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            VIN: vin,
            Make: make,
            Model: model,
            Year: year,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(vin, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<string> {

        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        
        const done = await this.CallOracle(ctx, assetString, newOwner)
                        .then(async (asset)=>{
                            // await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
                            if (asset){
                                return true
                            }
                        });
        if(done){
            return oldOwner;
        }
        // if(asset.Accident==5){
            // asset.AppraisedValue=asset.AppraisedValue*0.95
        // }
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        // await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        // return oldOwner;
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
    public async CallOracle(ctx: Context, assetString: string, newOwner: string): Promise<any> {
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        const id = asset.VIN;

        try {
            const apiKey = '795eb1c0';
            const request = async (id: string): Promise<Response> => {
                const response = await fetch('https://my.api.mockaroo.com/accident.json', {
                    method: 'POST',
                    headers: {
                    'X-API-KEY': apiKey
                    },
                    body: JSON.stringify({id})
                })
                .then((response) => response.json())
                .then(async (data)=>{
                    asset.Accident = data.accident;
                    if (data.accident == 5){
                        asset.AppraisedValue=asset.AppraisedValue*0.95
                    }
                    await ctx.stub.putState(asset.VIN, Buffer.from(stringify(sortKeysRecursive(asset))));
                    return data;
                })
                return response;
            };
            const response = await request(asset.VIN);
        } catch (error) {
            console.log('*** Successfully caught the error: \n', error);
        } finally {
            return true;
        }


    }

}
