/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        /*const assets = [
            {
                ID: 'asset1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
                AppraisedValue: 300,
            },
            {
                ID: 'asset2',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
                AppraisedValue: 400,
            },
            {
                ID: 'asset3',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
                AppraisedValue: 500,
            },
            {
                ID: 'asset4',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
                AppraisedValue: 600,
            },
            {
                ID: 'asset5',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
                AppraisedValue: 700,
            },
            {
                ID: 'asset6',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
                AppraisedValue: 800,
            }, */
			
			const assets = [
            {
                MSISDN: '02123456789',
				NOME: 'Austragesilo de Atadide',
				CPF: '12345678910',
				MCCMNC: 74512,
				OPERADORA: 'OI',
            },
            {
                MSISDN: '02123456788',
				NOME: 'Atadide de Austragesilo',
				CPF: '12345678911',
				MCCMNC: 74520,
				OPERADORA: 'VIVO',
            },
            {
                MSISDN: '02123456787',
				NOME: 'Gongonzolina Hermogena',
				CPF: '12345678912',
				MCCMNC: 74530,
				OPERADORA: 'CLARO',
            },
            {
                MSISDN: '02123456786',
				NOME: 'Hermogena Gongonzolina',
				CPF: '12345678913',
				MCCMNC: 74540,
				OPERADORA: 'SERCONTEL',
            },
            {
                MSISDN: '02123456785',
				NOME: 'Astrelopitecus Robustus',
				CPF: '12345678914',
				MCCMNC: 74550,
				OPERADORA: 'SURF',
            },
            {
                MSISDN: '02123456784',
				NOME: 'Josebes Gallobe',
				CPF: '12345678915',
				MCCMNC: 74560,
				OPERADORA: 'BRISANET',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.MSISDN, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, msisdn, nome, cpf, mccmnc, operadora) {
        const asset = {
            
			/*
			ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
			*/
			MSISDN: msisdn,
			NOME: nome,
			CPF: cpf,
			MCCMNC: mccmnc,
			OPERADORA: operadora,
        };
        await ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, msisdn) {
        const assetJSON = await ctx.stub.getState(msisdn); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, msisdn, nome, cpf, mccmnc, operadora) {
        const exists = await this.AssetExists(ctx, msisdn);
        if (!exists) {
            throw new Error(`The asset ${msisdn} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            /*ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,*/
			MSISDN: msisdn,
			NOME: nome,
			CPF: cpf,
			MCCMNC: mccmnc,
			OPERADORA: operadora,
        };
        return ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, msisdn) {
        const exists = await this.AssetExists(ctx, msisdn);
        if (!exists) {
            throw new Error(`The asset ${msisdn} does not exist`);
        }
        return ctx.stub.deleteState(msisdn);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, msisdn) {
        const assetJSON = await ctx.stub.getState(msisdn);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, msisdn, newMccmnc, newOperadora) {
        const assetString = await this.ReadAsset(ctx, msisdn);
        const asset = JSON.parse(assetString);
		asset.MCCMNC = newMccmnc;
        asset.OPERADORA = newOperadora;
        return ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;