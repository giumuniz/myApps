/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'basic';

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'userApp';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

app.post('/api/teste/',async function(req, res) {
    try {

      		
			console.log(req.body);
			
			res.json(req.body);
		

} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.post('/api/create/',async function(req, res) {
    try {
      	const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		const gateway = new Gateway();
				
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			
			const msisdn = req.body.msisdn;
			const nome = req.body.nome;
			
			console.log(res.json);
			console.log('\n--> Transação em andamento: CreateAsset, criação de novo MSISDN'+msisdn);
			let result = await contract.submitTransaction('CreateAsset', req.body.msisdn, req.body.nome,req.body.cpf,req.body.mccmnc, req.body.operadora);
			
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			res.status(200).json({response: `*** Resultado: ${prettyJSONString(result.toString())}`});

        await gateway.disconnect();

} catch (error) {
        console.error(`Falhou na execução da transação: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.post('/api/transfer/',async function(req, res) {
    try {

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			
			const msisdn = req.body.msisdn;
			const newMccmnc = req.body.newMccmnc;
			const novaOper = req.body.newOperadora
						
			console.log(req.body);
			console.log('\n--> Transação em andamento: TransferAsset, Execução da Portabilidade MSISDN '+msisdn+' nova operadora '+novaOper);
			
			let result = await contract.evaluateTransaction('ReadAsset', req.body.msisdn.toString());
			const resultTxt =  prettyJSONString(result.toString())
			console.log(resultTxt);
			await contract.submitTransaction('TransferAsset', msisdn, newMccmnc,novaOper);
			console.log('\n--> *** Resultado: Portabilidade Concluida com sucesso');
			let result2 =  await contract.evaluateTransaction('ReadAsset', req.body.msisdn.toString()); 
			const resultTxt2 =  prettyJSONString(result2.toString())
			console.log(resultTxt2);
				
			const finalResult = resultTxt.concat("\n",resultTxt2);

			res.status(200).json({response: `*** Resultado: Portabilidade concluída com sucesso ${finalResult}`});

        await gateway.disconnect();

} catch (error) {
        console.error(`Falhou na execução da transação: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.get('/api/query/:MSISDN_index', async function (req, res) {
    try {

		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		const gateway = new Gateway();
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
						
			const msisdn = req.params.MSISDN_index; 
			console.log(`\n--> Transação em andamento: ReadAsset, função retorna um usuário para um dado MSISDN' ${req.params.MSISDN_index}`);
			
			let result = await contract.evaluateTransaction('ReadAsset', req.params.MSISDN_index.toString()); 
			console.log(`*** Resultado: ${result.toString()}`);

			res.status(200).json({response: `*** Resultado: ${prettyJSONString(result.toString())}`});

        await gateway.disconnect();

} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.post('/api/initledger/', async function (req, res) {
    try {
     // construir um objeto em memória com a configuração da rede (Connection Profile)
		const ccp = buildCCPOrg1();

		// construir uma instância do cliente de serviços fabric CA com base nas informações na configuração da rede
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// configurar a carteira para armazenar as credenciais do usuário do aplicativo
		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const gateway = new Gateway();
		
		await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // utiliza asLocalhost: true para a rede fabric impementada localmente.
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
				
			await contract.submitTransaction('InitLedger'); 
			console.log('*** Resultado: inicialização completa');
			res.status(200).json({Response: "Resultado: inicialização completa"})
		
       // Desconectar do gateway.
        await gateway.disconnect();

} catch (error) {
        console.error(`Falha em executar esta transação: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.get('/api/queryAll/', async function (req, res) {
    try {

		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		const gateway = new Gateway();
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			
			console.log(`\n--> Read All`);
			
			let result = await contract.evaluateTransaction('GetAllAssets'); 
			console.log(`*** Result: ${result.toString()}`);
			res.status(200).json({response: `*** Result: ${prettyJSONString(result.toString())}`});
        await gateway.disconnect();

} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.listen(8080);