import {U} from "./u";
import * as Web3 from "web3";
import * as fs from "fs";

/**
 * Функция для подготовки контракта
 */
function prepareSol(param: {
											rpcHost: string,
											owner: string,
											withdrawal1: string,
											withdrawal2: string,
											bountyAcc: string,
											teamAcc: string }){
	let path = ".\\src\\contracts\\RobomedIco.sol";
	let text = fs.readFileSync(path).toString();

	text = text.replace(new RegExp('address public constant ADDR_OWNER = (.*);'), "address public constant ADDR_OWNER = " + param.owner + ";");
	text = text.replace(new RegExp('address public constant ADDR_WITHDRAWAL1 = (.*);'), "address public constant ADDR_WITHDRAWAL1 = " + param.withdrawal1 + ";");
	text = text.replace(new RegExp('address public constant ADDR_WITHDRAWAL2 = (.*);'), "address public constant ADDR_WITHDRAWAL2 = " + param.withdrawal2 + ";");
	text = text.replace(new RegExp('address public constant ADDR_BOUNTY_TOKENS_ACCOUNT = (.*);'), "address public constant ADDR_BOUNTY_TOKENS_ACCOUNT = " + param.bountyAcc + ";");
	text = text.replace(new RegExp('address public constant ADDR_TEAM_TOKENS_ACCOUNT = (.*);'), "address public constant ADDR_TEAM_TOKENS_ACCOUNT = " + param.teamAcc + ";");

	fs.writeFileSync(path, text);
}

/**
 * Функция для компилирования sol файлов
 */
function compileSol() {
	U.execProcessSync("build.bat");
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
	deployerPass: string }): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(param.rpcHost));

	let abi = JSON.parse(fs.readFileSync('out/RobomedIco.abi').toString());
	let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

	let gasLimit = web3.eth.getBlock(web3.eth.blockNumber).gasLimit;
	console.log("gasLimit: " + gasLimit);

	web3.personal.unlockAccount(param.deployer, param.deployerPass);
	//console.log("unlockAccount: " + param.deployer);

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
 * @param {string} rpcHost rpc host
 * @param {string} owner owner контракта
 * @param {string} ownerPass пароль owner
 * @param bountyAcc Адрес на счёте которого находятся нераспределённые bounty токены
 * @param teamAcc Адрес на счёте которого находятся нераспределённые team токены
 * @returns {Promise<any>} Контракт
 */
export async function deploy(rpcHost: string, deployer: string, deployerPass: string, owner: string, withdrawal1: string, withdrawal2: string, bountyAcc: string, teamAcc: string): Promise<any> {

	let web3 = new Web3(new Web3.providers.HttpProvider(rpcHost));

	deployer = (<any>web3).toChecksumAddress(deployer);
	owner = (<any>web3).toChecksumAddress(owner);
	withdrawal1 = (<any>web3).toChecksumAddress(withdrawal1);
	withdrawal2 = (<any>web3).toChecksumAddress(withdrawal2);
	bountyAcc = (<any>web3).toChecksumAddress(bountyAcc);
	teamAcc = (<any>web3).toChecksumAddress(teamAcc);

	// Подготавливаем контракт - заменяем константы
	prepareSol({
		rpcHost: rpcHost,
		owner: owner,
		withdrawal1: withdrawal1,
		withdrawal2: withdrawal2,
		bountyAcc: bountyAcc,
		teamAcc: teamAcc
	});

	// компилируем
	compileSol();

	// загружаем в сеть
	let contract = await uploadContract({
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



