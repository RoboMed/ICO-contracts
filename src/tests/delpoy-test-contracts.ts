import {U} from "./u";
import * as Web3 from "web3";
import * as fs from "fs";

/**
 * Функция для компилирования sol файлов
 */
function compileSol() {
	U.execProcessSync("build-test-contracts.bat");
	console.log("contracts compiled");
}

/**
 * Функция для загрузки контракта в сеть
 * @param {string} param Параметры
 * @returns {Promise<any>} Контракт
 */
function uploadContract(param: {
	contractName: string,
	rpcHost: string,
	deployer: string,
	deployerPass: string
}): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(param.rpcHost));
	let gasLimit = web3.eth.getBlock(web3.eth.blockNumber).gasLimit;
	web3.personal.unlockAccount(param.deployer, param.deployerPass);

	let abi = JSON.parse(fs.readFileSync('out/' + param.contractName + '.abi').toString());
	let compiled = '0x' + fs.readFileSync('out/' + param.contractName + '.bin');

	return new Promise((resolve, reject) => {
		(<any>web3.eth.contract(abi)).new(
			{
				data: compiled,
				from: param.deployer,
				gas: gasLimit
			}, (err: any, contract: any) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				else if (contract.address) {
					resolve(contract);
				}
			});
	});
}

/**
 * Функция компилирует и деплоит контракт
 * @param {string} contractName имя контракта
 * @param {string} rpcHost rpc host
 * @returns {Promise<any>} Контракт
 */
export async function deploy(contractName: string, rpcHost: string, deployer: string, deployerPass: string): Promise<any> {

	// компилируем
	compileSol();

	// загружаем в сеть
	let contract = await uploadContract({
		contractName: contractName,
		rpcHost: rpcHost,
		deployer: deployer,
		deployerPass: deployerPass,

	}); //Promise;

	console.log("contract deployed");
	console.log("contract.deployer: " + deployer);
	console.log("contract.address: " + contract.address);
	console.log();

	return contract;
}



