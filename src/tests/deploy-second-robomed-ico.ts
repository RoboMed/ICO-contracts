import {U} from "./u";
import * as Web3 from "web3";
import * as fs from "fs";

/**
 * Функция для компилирования sol файлов
 */
function compileSol() {
	U.execProcessSync("build-test-contracts.bat");
	console.log("contract compiled");
}

/**
 * Функция для загрузки контракта в сеть
 * @param {string} param Параметры
 * @returns {Promise<any>} Контракт
 */
function uploadContract(param: {
	rpcHost: string,
	deployer: string,
	deployerPass: string,
	originalIco: string,
	owner: string}): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(param.rpcHost));

	let abi = JSON.parse(fs.readFileSync('out/TestSecondRobomedIco.abi').toString());
	let compiled = '0x' + fs.readFileSync("out/TestSecondRobomedIco.bin");

	let gasLimit = web3.eth.getBlock(web3.eth.blockNumber).gasLimit;
	console.log("gasLimit: " + gasLimit);

	web3.personal.unlockAccount(param.deployer, param.deployerPass);
	//console.log("unlockAccount: " + param.deployer);

	return new Promise((resolve, reject) => {

		(<any>web3.eth.contract(abi)).new(
			param.originalIco,
			param.owner,
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
 * @param {string} rpcHost rpc host
 * @param {string} owner owner контракта
 * @param {string} ownerPass пароль owner
 * @param bountyAcc Адрес на счёте которого находятся нераспределённые bounty токены
 * @param teamAcc Адрес на счёте которого находятся нераспределённые team токены
 * @returns {Promise<any>} Контракт
 */
export async function deploy(rpcHost: string, deployer: string, deployerPass: string, originalIco: string, owner: string): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(rpcHost));

	deployer = (<any>web3).toChecksumAddress(deployer);
	originalIco = (<any>web3).toChecksumAddress(originalIco);
	owner = (<any>web3).toChecksumAddress(owner);

	// компилируем
	compileSol();

	// загружаем в сеть
	let contract = await uploadContract({
		rpcHost: rpcHost,
		deployer: deployer,
		deployerPass: deployerPass,
		originalIco: originalIco,
		owner: owner
	}); //Promise;

	console.log("contract deployed");
	console.log("contract.deployer: " + deployer);
	console.log("contract.address: " + contract.address);
	console.log();

	return contract;
}



