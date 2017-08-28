import "mocha";
import * as assert from "assert";
import * as BigNumber from 'bignumber.js';
import * as Web3 from "web3";
import {U} from "./u";
import {Config} from "./config";
import {ContractConstants} from "./contract-constants";
import {IcoStates} from "./ico-states";
import {bnWr} from "./bn-wr";
import {TestAccounts, prepare} from "./prepare-test-data";
import {deploy} from "./deploy-to-target";

//add extra mocha options: --require ts-node/register --timeout 100000

let web3: any;
let contract: any;
let config: Config = null;
let accs: TestAccounts;
let CONSTANTS: any;

describe('Test Ico-contract', () => {


	/**
	 * runs before all tests in this block
	 */
	before('before', () => {

		BigNumber.config({EXPONENTIAL_AT: 1e+9});

		config = U.getConfig();
		web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

		assert.ok(config != undefined);
		assert.ok(web3 != undefined);
	});

	/**
	 * runs before each test in this block
	 */
	beforeEach('beforeEach', async () => {

		accs = prepare(config);
		let c = await deploy(config.rpcAddress, accs.owner, config.accountPass);

		contract = web3.eth.contract(c.abi).at(c.address);
		CONSTANTS = new ContractConstants(contract);

		// Разлочиваем все счета
		[accs.owner,
			accs.lucky,
			accs.user1,
			accs.user2
		].map(acc => {
			web3.personal.unlockAccount(acc, config.accountPass)
		});

	});

	/**
	 * Тест для проверки начального состояния контракта
	 */
	it('test-contract-init', () => {

		checkContract({
			currentState: IcoStates.VipPlacement,
			totalBalance: bnWr(new BigNumber(0)),
			totalSupply: CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT,
			totalBought: bnWr(new BigNumber(0)),
			rate: bnWr(new BigNumber(0)),
		});

		//Проверяем, что была выполнена эмиссия на кошелек владельца
		let balance = bnWr(contract.balanceOf(accs.owner));
		assert.equal(balance.strVal, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.strVal)
	});

	it('test-transfer-all', () => {
		// Тест на передачу VIP токенов одному юзеру

		let txHash = contract.transfer(accs.user1, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT);
		U.waitForTransactions(web3, txHash);

		let contractRmTokens = contract.balanceOf(accs.owner);
		let user1RmTokens = contract.balanceOf(accs.user1);

		assert.ok(contractRmTokens.equals(0));
		assert.ok(user1RmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
	});

	/**
	 * Тест, что нельзя передавать VIP токенов больше чем есть
	 */
	it('test-transfer-vipTokens-overflow', () => {

		// Кол-во оставшихся VIP токенов + 1
		let count = bnWr(contract.vipPlacementNotDistributed().add(1));

		// Пытаемся передать VIP токенов больше чем осталось
		let res = execInEth(() => contract.transfer(accs.user1, count, txParams(accs.owner)));
		assert.ok(!res);

		let contractRmTokens = bnWr(contract.balanceOf(accs.owner));
		let user1RmTokens = bnWr(contract.balanceOf(accs.user1));

		// Ничего не должно измениться
		assert.ok(contractRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
		assert.ok(user1RmTokens.equals(0));

		checkContract({
			totalBought: new BigNumber(0),
			vipPlacementNotDistributed: CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT
		});
	});

	it('test-transfer-3-distribution', () => {

		// user1 получает 100 rmToken
		// user2 получает 200 rmToken
		let txHash1 = contract.transfer(accs.user1, new BigNumber(100));
		let txHash2 = contract.transfer(accs.user2, new BigNumber(200));
		U.waitForTransactions(web3, [txHash1, txHash2]);

		let contractRmTokens = contract.balanceOf(accs.owner);
		let user1RmTokens = contract.balanceOf(accs.user1);
		let user2RmTokens = contract.balanceOf(accs.user2);

		assert.ok(contractRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
		assert.ok(user1RmTokens.equals(100));
		assert.ok(user2RmTokens.equals(200));

		// пытаемся перечислить user1 max - 100 - 200 + 1
		let txHashErr = contract.transfer(accs.user1, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200).add(1));
		//u.delaySync(4000);
		//let res = web3.eth.getTransactionReceipt(txHashErr);

		// Ничего не должно измениться
		assert.ok(contractRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
		assert.ok(user1RmTokens.equals(100));
		assert.ok(user2RmTokens.equals(200));
	});

	/**
	 * Тест перехода стадий VipPlacement -> PreSale
	 */
	it('test-goToState-preSale', () => {

		let addr = accs.user1;

		// Проверяем, что мы на стадии VipPlacement
		assert.ok(contract.currentState().equals(IcoStates.VipPlacement));

		// Ждем пока нельзя переходить на PreSale
		while (!contract.canGotoState(IcoStates.PreSale)) {
		}

		// Дергаем ручку
		let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(addr)));
		assert.ok(res);

		// Должны быть на стадии PreSale
		assert.ok(contract.currentState().equals(IcoStates.PreSale));

		//Проверяем, что получили приз
		let priceRes = contract.balanceOf(addr);
		assert.ok(priceRes.equals(CONSTANTS.PRIZE_SIZE_FORGOTO));
	});


	/**
	 * Тест, что юзеры не могут передать свои токены до PostIco
	 */
	it('test-cannot-transfer-tokens-before-postIco', () => {

		// Сумма, которую будем покупать, передавать
		let sum = bnWr(new BigNumber(1));
		let bUser1, bUser2;

		// Передаем vipTokens юзеру 1
		let res1 = execInEth(() => contract.transfer(accs.user1, sum, txParams(accs.owner)));
		assert.ok(res1);

		// Проверяем баланс
		bUser1 = bnWr(contract.balanceOf(accs.user1));
		assert.ok(bUser1.equals(sum));

		// Юзер 1 пытается передать их юзеру 2
		let res2 = execInEth(() => contract.transfer(accs.user2, sum, txParams(accs.user1)));
		assert.ok(!res2);

		// Проверяем балансы
		bUser1 = bnWr(contract.balanceOf(accs.user1));
		bUser2 = bnWr(contract.balanceOf(accs.user2));

		assert.ok(bUser1.equals(sum));
		assert.ok(bUser2.equals(new BigNumber(0)));
	});


	/**
	 * Тест покупки на preSale
	 */
	it('test-buy-on-preSale', () => {

		let user = accs.user1;
		goToPreSale();

		// Свободные токены должны быть в ко-ве эмиссии
		checkContract({
			freeMoney: CONSTANTS.EMISSION_FOR_PRESALE,
			totalBought: new BigNumber(0)
		});

		// Пытаемся купить rmToken
		let etherCount = bnWr(new BigNumber(1));

		// Считаем, сколько rmToken должны купить на 1 ether
		let count = bnWr(web3.toWei(etherCount).mul(CONSTANTS.RATE_PRESALE));

		// Выполняем покупку
		let res = execInEth(() => contract.buyTokens(user, txParams(user, web3.toWei(etherCount))));
		assert.ok(res);

		// Проверяем что купили
		let userRmTokens = bnWr(contract.balanceOf(user));

		assert.ok(userRmTokens.equals(count));
		checkContract({
			freeMoney: CONSTANTS.EMISSION_FOR_PRESALE.minus(count),
			totalBought: count
		});
	});

	/**
	 * Вспомагательная функция проверяет значения полей контракта
	 * @param params
	 */
	function checkContract(params: any) {

		if (params.hasOwnProperty('currentState')) {
			let value = bnWr(contract.currentState());
			let expected = params.currentState;
			assert.equal(value.strVal, expected.strVal, "currentState");
		}

		if (params.hasOwnProperty('totalBalance')) {
			let value = bnWr(contract.totalBalance());
			let expected = params.totalBalance;
			assert.equal(value.strVal, expected.strVal, "totalBalance");
		}

		if (params.hasOwnProperty('freeMoney')) {
			let value = bnWr(contract.freeMoney());
			let expected = params.freeMoney;
			assert.equal(value.strVal, expected.strVal, "freeMoney");
		}

		if (params.hasOwnProperty('totalSupply')) {
			let value = bnWr(contract.totalSupply());
			let expected = params.totalSupply;
			assert.equal(value.strVal, expected.strVal, "totalSupply");
		}

		if (params.hasOwnProperty('totalBought')) {
			let value = bnWr(contract.totalBought());
			let expected = params.totalBought;
			assert.equal(value.strVal, expected.strVal, "totalBought");
		}

		if (params.hasOwnProperty('vipPlacementNotDistributed')) {
			let value = bnWr(contract.vipPlacementNotDistributed());
			let expected = params.vipPlacementNotDistributed;
			assert.equal(value.strVal, expected.strVal, "vipPlacementNotDistributed");
		}

		if (params.hasOwnProperty('remForPreSale')) {
			let value = bnWr(contract.remForPreSale());
			let expected = params.remForPreSale;
			assert.equal(value.strVal, expected.strVal, "remForPreSale");
		}

		if (params.hasOwnProperty('rate')) {
			let value = bnWr(contract.rate());
			let expected = params.rate;
			assert.equal(value.strVal, expected.strVal, "rate");
		}
	}

	function txParams(addr: string, value?: BigNumber.BigNumber): any {
		let res = {from: addr, gas: 200000};
		if (value != null) {

			res = <any>{
				...res,
				value: value
			};
		}
		return res;
	}

	function execInEth(act: () => string) {
		let txHash = null;
		try {
			txHash = act();
		} catch (err) {
			return false;
		}
		while (web3.eth.getTransactionReceipt(txHash) === null) {
		}

		let txRec = web3.eth.getTransactionReceipt(txHash);
		let tx = web3.eth.getTransaction(txHash);
		if (txRec.blockNumber === null || tx.blockNumber === null) {
			throw `${txRec.blockNumber} - ${tx.blockNumber}`;
		}

		return tx.gas > txRec.gasUsed;
	}

	/**
	 * Вспомагательный метод переводит контракт на PreSale
	 */
	function goToPreSale() {

		while (!contract.canGotoState(IcoStates.PreSale)) {
		}

		let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(accs.lucky)));

		assert.ok(res);
	}

});