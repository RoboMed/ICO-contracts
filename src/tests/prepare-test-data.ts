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
	 * Владелец контракта
	 */
	owner: string;

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
	let owner = web3.personal.newAccount(config.accountPass);
	let user1 = web3.personal.newAccount(config.accountPass);
	let user2 = web3.personal.newAccount(config.accountPass);
	let lucky = web3.personal.newAccount(config.accountPass);

	// Пополняем кошельки
	let coinSourceAccount = web3.eth.coinbase;
	web3.personal.unlockAccount(coinSourceAccount, config.accountPass);
	let tx1 = web3.eth.sendTransaction({from: coinSourceAccount, to: owner, value: web3.toWei(1, "ether")});
	let tx2 = web3.eth.sendTransaction({from: coinSourceAccount, to: user1, value: web3.toWei(1, "ether")});
	let tx3 = web3.eth.sendTransaction({from: coinSourceAccount, to: user2, value: web3.toWei(1, "ether")});
	let tx4 = web3.eth.sendTransaction({from: coinSourceAccount, to: lucky, value: web3.toWei(1, "ether")});

	//ждем, пока все монеты дойдут
	U.waitForTransactions(web3, [tx1, tx2, tx3, tx4]);

	//Возвращаем готовые тестовые данные
	let data = {
		owner: owner,
		lucky: lucky,
		user1: user1,
		user2: user2
	};

	console.log(data);

	return data;
}



