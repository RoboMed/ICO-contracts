import {Config} from "./config";
import * as fs from "fs";
import * as child_process from "child_process";

export module U {

	/**
	 * Вспомагательный метод для задержки
	 * @param {number} ms Задержка в ms
	 */
	export function delay(ms: number): Promise<void> {
		return new Promise(((resolve, reject) => {
			setTimeout(() => {
				resolve()
			}, ms);
		}))
	}

	/**
	 * Метод получает конфиг приложения
	 * @returns {Config} Конфиг
	 */
	export function getConfig(): Config {

		let env = process.env;

		try {
			let configFile = env["CONFIGFILE"];
			let data = fs.readFileSync(configFile).toString();
			let config = JSON.parse(data);

			return config;
		}
		catch (e) {
			console.error(e);
			console.log("env:");
			console.log(env);
			throw e;
		}
	}

	export function execProcessSync(cmd: string) :void{
			child_process.execSync(cmd);
	}

	export function waitForTransactions(web3: any, txObj: string | string[]) {

		let txHashes = Array.isArray(txObj) ? txObj : [txObj];

		//Пока есть хотя бы одна невыполненная транзакция, ждем
		while (txHashes.find((txHash) => {
			return web3.eth.getTransactionReceipt(txHash) != null
		}) != null) {
			//do nothing
		}
	}

	/**
	 * Получение текущей даты в UTC
	 * @returns {Date}
	 */
	export function getUtcNow() {
		let now = new Date();
		return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	}
}