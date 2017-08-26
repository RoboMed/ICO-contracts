import {U} from "./u";
import * as Web3 from "web3";
import * as fs from "fs";

/**
 * Функция для компилирования sol файлов
 */
function compileSol() {

	U.execProcessSync("build.bat");
	console.log("contract compiled");
}

/**
 * Функция для загрузки контракта в сеть
 * @param {string} rpcHost rpc host
 * @param {string} owner owner контракта
 * @param {string} ownerPass пароль owner
 * @returns {Promise<any>} Контракт
 */
function uploadContract(rpcHost: string, owner: string, ownerPass: string): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(rpcHost));

	let abi = JSON.parse(fs.readFileSync('out/RobomedIco.abi').toString());
	let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

	let gasEstimate = web3.eth.estimateGas({data: compiled}) + 1000000;
	//console.log("gasEstimate: " + gasEstimate);

	web3.personal.unlockAccount(owner, ownerPass);
	//console.log("unlockAccount: " + from);

	return new Promise((resolve, reject) => {

		(<any>web3.eth.contract(abi)).new({
			data: compiled,
			from: owner,
			gas: gasEstimate
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
 * @param {string} rpcHost rpc host
 * @param {string} owner owner контракта
 * @param {string} ownerPass пароль owner
 * @returns {Promise<any>} Контракт
 */
export async function deploy(rpcHost: string, owner: string, ownerPass: string): Promise<any> {

	// компилируем
	compileSol();

	// загружаем в сеть
	let contract = await uploadContract(rpcHost, owner, ownerPass); //Promise;

	console.log("contract.owner: " + owner);
	console.log("contract.address: " + contract.address);
	console.log("contract.abi: " + JSON.stringify(contract.abi));
	console.log();

	return contract;
}



