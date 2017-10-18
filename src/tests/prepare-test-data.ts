import * as Web3 from "web3";
import {U} from "./u";
import {Config} from "./config";

////////////////////////////////////////////////////
//
// Скрипт для подготовки сети перед тестированием
// Во время работы скрипта:
//  -должен быть запущен geth
//  -майнинг должен выполняться
//
////////////////////////////////////////////////////

/**
 * Интерфейс тестовых аккаунтов
 */
export interface TestAccounts {

	/**
	 * Тот, кто разворачивает контракт
	 */
	deployer: string;

	/**
	 * Владелец контракта
	 */
	owner: string;

	/**
	 * Участник контракта 1
	 */
	withdrawal1: string;

	/**
	 * Участник контракта 2
	 */
	withdrawal2: string;

	/**
	 * Служебный аккаунт который будет дергать "ручку" и получать приз
	 */
	lucky: string;

	/**
	 * Тестовый юзер 1
	 */
	user1: string;

	/**
	 * Тестовый юзер 2
	 */
	user2: string;

	/**
	 * Адрес на счёте которого находятся нераспределённые bounty токены
	 */
	bounty: string;

	/**
	 * Адрес на счёте которого находятся нераспределённые team токены
	 */
	team: string
}

/**
 * Функция выполняет подготовку тестовых аккаунтов
 * @returns {TestAccounts} Тестовые аккаунты
 */
export function prepare(config: Config = null): TestAccounts {

	config = config != null ? config : U.getConfig();
	let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

	// Если майнинг не запущен - ошибка
	let isMining = web3.eth.mining;
	if (!isMining) throw "Должен выполняться майнинг в сети";

	// Создаем несколько новых аккаунтов
	let deployer = web3.personal.newAccount(config.accountPass);
	let owner = web3.personal.newAccount(config.accountPass);
	let withdrawal1 = web3.personal.newAccount(config.accountPass);
	let withdrawal2 = web3.personal.newAccount(config.accountPass);
	let user1 = web3.personal.newAccount(config.accountPass);
	let user2 = web3.personal.newAccount(config.accountPass);
	let lucky = web3.personal.newAccount(config.accountPass);
	let bounty = web3.personal.newAccount(config.accountPass);
	let team = web3.personal.newAccount(config.accountPass);

	// Пополняем кошельки
	let coinSourceAccount = web3.eth.coinbase;
	web3.personal.unlockAccount(coinSourceAccount, config.accountPass);

	let txs = [
		web3.eth.sendTransaction({from: coinSourceAccount, to: deployer, value: web3.toWei(1, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: owner, value: web3.toWei(5, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: withdrawal1, value: web3.toWei(1, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: withdrawal2, value: web3.toWei(1, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: user1, value: web3.toWei(50, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: user2, value: web3.toWei(1, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: lucky, value: web3.toWei(100, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: bounty, value: web3.toWei(1, "ether")}),
		web3.eth.sendTransaction({from: coinSourceAccount, to: team, value: web3.toWei(1, "ether")}),
	];

	//ждем, пока все монеты дойдут
	U.waitForTransactions(web3, txs);

	//Возвращаем готовые тестовые данные
	let data = {
		deployer: deployer,
		owner: owner,
		withdrawal1: withdrawal1,
		withdrawal2: withdrawal2,
		lucky: lucky,
		user1: user1,
		user2: user2,
		bounty: bounty,
		team: team
	};

	console.log(data);

	return data;
}




