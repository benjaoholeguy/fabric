/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

async function savePrivateData(ctx, assetKey) {
	const clientOrg = ctx.clientIdentity.getMSPID();
	const peerOrg = ctx.stub.getMspID();
	const collection = '_implicit_org_' + peerOrg;

	if (clientOrg === peerOrg) {
		const transientMap = ctx.stub.getTransient();
		if (transientMap) {
			const properties = transientMap.get('asset_properties');
			if (properties) {
				await ctx.stub.putPrivateData(collection, assetKey, properties);
			}
		}
	}
}

async function removePrivateData(ctx, assetKey) {
	const clientOrg = ctx.clientIdentity.getMSPID();
	const peerOrg = ctx.stub.getMspID();
	const collection = '_implicit_org_' + peerOrg;

	if (clientOrg === peerOrg) {
		const propertiesBuffer = await ctx.stub.getPrivateData(collection, assetKey);
		if (propertiesBuffer && propertiesBuffer.length > 0) {
			await ctx.stub.deletePrivateData(collection, assetKey);
		}
	}
} 

async function addPrivateData(ctx, assetKey, asset) {
	const clientOrg = ctx.clientIdentity.getMSPID();
	const peerOrg = ctx.stub.getMspID();
	const collection = '_implicit_org_' + peerOrg;

	if (clientOrg === peerOrg) {
		const propertiesBuffer = await ctx.stub.getPrivateData(collection, assetKey);
		if (propertiesBuffer && propertiesBuffer.length > 0) {
			const properties = JSON.parse(propertiesBuffer.toString());
			asset.asset_properties = properties;
		}
	}
}

async function readState(ctx, id) {
	const assetBuffer = await ctx.stub.getState(id); // get the asset from chaincode state
	if (!assetBuffer || assetBuffer.length === 0) {
		throw new Error(`The asset ${id} does not exist`);
	}
	const assetString = assetBuffer.toString();
	const asset = JSON.parse(assetString);

	return asset;
}

class AssetTransferEvents extends Contract {

	// CreateAsset issues a new asset to the world state with given details.
	async CreateAsset(ctx, id, supplier_id, part_name, shipment_method_type, appraisedValue, shipment_date, expected_shipment_date, longitude, latitude, quantity) {
		// ctx: Context, product_id: string, supplier_id: string, part_name: string, shipment_method_type: string, appraisedValue: number, shipment_date?: string, expected_shipment_date?: Date, longitude?: number, latitude?: number, quantity?: number
		const asset = {
			product_id: id,
            supplier_id: supplier_id,
            part_name: part_name,
            shipment_date: shipment_date,
            expected_shipment_date: expected_shipment_date,
            shipment_method_type: shipment_method_type,
            longitude: longitude,
            latitude: latitude,
            quantity: quantity,
            appraisedValue: appraisedValue,
		};
		await savePrivateData(ctx, id);
		const assetBuffer = Buffer.from(JSON.stringify(asset));

		ctx.stub.setEvent('CreateAsset', assetBuffer);
		return ctx.stub.putState(id, assetBuffer);
	}

	// TransferAsset updates the owner field of an asset with the given id in
	// the world state.
	async TransferAsset(ctx, id, quantity) {
		const asset = await readState(ctx, id);
		// asset.Owner = newOwner;
		asset.quantity = quantity;
		const assetBuffer = Buffer.from(JSON.stringify(asset));
		await savePrivateData(ctx, id);

		ctx.stub.setEvent('TransferAsset', assetBuffer);
		return ctx.stub.putState(id, assetBuffer);
	}

	// ReadAsset returns the asset stored in the world state with given id.
	async ReadAsset(ctx, id) {
		const asset = await readState(ctx, id);
		await addPrivateData(ctx, asset.product_id, asset);

		return JSON.stringify(asset);
	}

	// UpdateAsset updates an existing asset in the world state with provided parameters.
	async UpdateAsset(ctx, id, supplier_id, part_name, shipment_method_type, appraisedValue, shipment_date, expected_shipment_date, longitude, latitude, quantity) {
		const asset = await readState(ctx, id);
		asset.product_id = id;
		asset.supplier_id = supplier_id;
		asset.part_name = part_name;
		asset.shipment_date = shipment_date;
		asset.expected_shipment_date = expected_shipment_date;
		asset.shipment_method_type = shipment_method_type;
		asset.longitude = longitude;
		asset.latitude = latitude;
		asset.quantity = quantity;
		asset.appraisedValue = appraisedValue;
		const assetBuffer = Buffer.from(JSON.stringify(asset));
		await savePrivateData(ctx, id);

		ctx.stub.setEvent('UpdateAsset', assetBuffer);
		return ctx.stub.putState(id, assetBuffer);
	}

	// DeleteAsset deletes an given asset from the world state.
	async DeleteAsset(ctx, id) {
		const asset = await readState(ctx, id);
		const assetBuffer = Buffer.from(JSON.stringify(asset));
		await removePrivateData(ctx, id);

		ctx.stub.setEvent('DeleteAsset', assetBuffer);
		return ctx.stub.deleteState(id);
	}
}

module.exports = AssetTransferEvents;
