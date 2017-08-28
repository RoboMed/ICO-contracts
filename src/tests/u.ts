import {Config} from "./config";
import * as fs from "fs";
import * as child_process from "child_process";

export module U {

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

	export function execProcessSync(cmd: string) {
		child_process.execSync(cmd, function (error: any, stdout: any, stderr: any) {
			console.log(error);
			console.log(stdout);
			console.log(stderr);

			if (error != null) throw error;
		});
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
}