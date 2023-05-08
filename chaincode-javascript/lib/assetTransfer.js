/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    // Carrega um lista inicial de usuários
    async InitLedger(ctx) {
        		
			const assets = [
            {
                MSISDN: '02123456789',
				NOME: 'Bodhidharma Cohesive',
				CPF: '12345678910',
				MCCMNC: 74512,
				OPERADORA: 'OI',
            },
            {
                MSISDN: '02123456788',
				NOME: 'Norwegian Rubbers',
				CPF: '12345678911',
				MCCMNC: 74520,
				OPERADORA: 'VIVO',
            },
            {
                MSISDN: '02123456787',
				NOME: 'Mosaic Peppered',
				CPF: '12345678912',
				MCCMNC: 74530,
				OPERADORA: 'CLARO',
            },
            {
                MSISDN: '02123456786',
				NOME: 'Assiduous Revere',
				CPF: '12345678913',
				MCCMNC: 74540,
				OPERADORA: 'SERCONTEL',
            },
            {
                MSISDN: '02123456785',
				NOME: 'Delegated Waitresses',
				CPF: '12345678914',
				MCCMNC: 74550,
				OPERADORA: 'SURF',
            },
            {
                MSISDN: '02123456784',
				NOME: 'Hotpoint Highlander',
				CPF: '12345678915',
				MCCMNC: 74560,
				OPERADORA: 'BRISANET',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.MSISDN, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.MSISDN} initialized`);
        }
    }
    // CreateAsset cria novo usuário no estado global (world state) com os detalhes fornecidos.
    async CreateAsset(ctx, msisdn, nome, cpf, mccmnc, operadora) {
        const asset = {
			MSISDN: msisdn,
			NOME: nome,
			CPF: cpf,
			MCCMNC: mccmnc,
			OPERADORA: operadora,
        };
        await ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset retorna um usuário registrado, a partir do MSISDN fornecido .
    async ReadAsset(ctx, msisdn) {
        const assetJSON = await ctx.stub.getState(msisdn);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`O usuário ${msisdn} não existe`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset atualiza um usuário existente conforme os parâmentros fornecidos.
    async UpdateAsset(ctx, msisdn, nome, cpf, mccmnc, operadora) {
        const exists = await this.AssetExists(ctx, msisdn);
        if (!exists) {
            throw new Error(`O usuário ${msisdn} não existe`);
        }

        // Sobrescrevendo o usuário original com os novos parâmetros
        const updatedAsset = {
			MSISDN: msisdn,
			NOME: nome,
			CPF: cpf,
			MCCMNC: mccmnc,
			OPERADORA: operadora,
        };
        return ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset remove um usuário existente conforme o parâmetro MSISDN fornecido.
    async DeleteAsset(ctx, msisdn) {
        const exists = await this.AssetExists(ctx, msisdn);
        if (!exists) {
            throw new Error(`O usuário ${msisdn} não existe`);
        }
        return ctx.stub.deleteState(msisdn);
    }

    // AssetExists retorna true quando um usuário com o MSISDN fornecido existe no estado glogal (world state).
    async AssetExists(ctx, msisdn) {
        const assetJSON = await ctx.stub.getState(msisdn);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset atualiza os dados do usuário com o MSISDN fornecido.
    async TransferAsset(ctx, msisdn, newMccmnc, newOperadora) {
        const assetString = await this.ReadAsset(ctx, msisdn);
        const asset = JSON.parse(assetString);
		asset.MCCMNC = newMccmnc;
        asset.OPERADORA = newOperadora;
        return ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets retorna todos os usuários existentes no estado global (world state).
    async GetAllAssets(ctx) {
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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;