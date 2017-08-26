import {U} from "./u";
import * as Web3 from "web3";

////////////////////////////////////////////////////
//
// Скрипт для подготовки новой сети перед тестированием
// Создает новый аккаунт для майнинга и выставляет его в coinbase
//
// Во время работы скрипта:
//  -должен быть запущен geth
//
////////////////////////////////////////////////////

/**
 * Функция для подготовки новой сети перед тестированием
 * @returns coinbase
 */
export function prepare() {

	let config = U.getConfig();

	let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

	let coinbase = web3.personal.newAccount(config.accountPass);

	let exec = " \"miner.setEtherbase('" + coinbase + "');\" ";
	let cmd = "geth attach --exec " + exec;

	U.execProcessSync(cmd);

	return coinbase;
}



