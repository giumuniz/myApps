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

      // build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		//await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		//await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		//CRiação da instância de um gateway para interação com a rede Fabric-test
		const gateway = new Gateway();
		
		
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			// Cria uma instância do da rede fabric-test baseada no canal onde o chaincode foi implementado.
			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);
			
			const msisdn = req.body.msisdn;
			const nome = req.body.nome;
			
			
			console.log(req.body);
			res.json(req.body);
			
			console.log(res.json);
			console.log('\n--> Transação em andamento: CreateAsset, criação de novo MSISDN'+msisdn);
			let result = await contract.submitTransaction('CreateAsset', req.body.msisdn, req.body.nome,req.body.cpf,req.body.mccmnc, req.body.operadora);
			
//await contract.submitTransaction('createCar', req.body.carid, req.body.make, req.body.model, req.body.colour, req.body.owner);

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			res.status(200).json({response: `*** Resultado: ${prettyJSONString(result.toString())}`});


       // Disconnect from the gateway.
        await gateway.disconnect();

} catch (error) {
        console.error(`Falhou na execução da transação: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.post('/api/transfer/',async function(req, res) {
    try {

      // build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		const gateway = new Gateway();
		
		
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});

			// Cria uma instância do da rede fabric-test baseada no canal onde o chaincode foi implementado.
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
		
       // Desconectar do gateway.
        await gateway.disconnect();

} catch (error) {
        console.error(`Falhou na execução da transação: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.get('/api/query/:MSISDN_index', async function (req, res) {
    try {

      // build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		//await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		//await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();
		
		// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			
						
			const msisdn = req.params.MSISDN_index; 
			
			console.log(`Parametro da entrada ${req.params.MSISDN_index}`)
			
			console.log(`\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given MSISDN' ${req.params.MSISDN_index}`);
			
			let result = await contract.evaluateTransaction('ReadAsset', req.params.MSISDN_index.toString()); 
			//, req.body.nome,req.body.cpf, req.body.mccmnc, req.body.operadora);
			//result = await contract.evaluateTransaction('ReadAsset', '02123456785');
			console.log(`*** Resultado: ${result.toString()}`);
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			res.status(200).json({response: `*** Resultado: ${prettyJSONString(result.toString())}`});

       // Disconnect from the gateway.
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
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});

app.get('/api/queryAll/', async function (req, res) {
    try {

      // build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		//await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		//await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();
		
		// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			
			console.log(`\n--> Read All`);
			
			let result = await contract.evaluateTransaction('GetAllAssets'); 
			//, req.body.nome,req.body.cpf, req.body.mccmnc, req.body.operadora);
			//result = await contract.evaluateTransaction('ReadAsset', '02123456785');
			console.log(`*** Result: ${result.toString()}`);
			res.status(200).json({response: `*** Result: ${prettyJSONString(result.toString())}`});
			//console.log(`*** Result: ${prettyJSONString(result.toString())}`);


       // Disconnect from the gateway.
        await gateway.disconnect();

} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.listen(8080);