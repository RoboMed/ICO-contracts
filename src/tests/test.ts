import "mocha";
import * as assert from "assert";
import * as BigNumber from 'bignumber.js';
import * as Web3 from "web3";
import {U} from "./u";
import {Config} from "./config";
import {ContractConstants} from "./contract-constants";
import {IcoStates} from "./ico-states";
import {bnWr, BnWr} from "./bn-wr";
import {TestAccounts, prepare} from "./prepare-test-data";
import {deploy} from "./deploy-to-target";
import {Contract, txParams} from "./contract";

//add extra mocha options: --require ts-node/register --timeout 100000

let web3: any;
let contract: Contract;
let config: Config = null;
let accs: TestAccounts;
let CONSTANTS: ContractConstants;

/**
 * Параметры для проверки свойств контракта
 */
interface CheckContractParams {
	currentState?: BnWr;
	totalBalance?: BnWr;
	freeMoney?: BnWr;
	totalSupply?: BnWr;
	totalBought?: BnWr;
	vipPlacementNotDistributed?: BnWr;
	remForPreSale?: BnWr;
	rate?: BnWr;
}

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
		let c = await deploy(config.rpcAddress, accs.owner, config.accountPass, accs.bounty, accs.team);

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
		assertEq(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, balance);
	});

	/**
	 * Тест передачи всех токенов одному юзеру
	 */
	it('test-transfer-all', () => {

		// Передаем все имеющиеся токены одному юзеру
		let res = execInEth(() => contract.transfer(accs.user1, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, txParams(accs.owner)));
		assert.ok(res);

		let contractRmTokens = contract.balanceOf(accs.owner);
		let user1RmTokens = contract.balanceOf(accs.user1);

		assert.ok(contractRmTokens.equals(0));
		assert.ok(user1RmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));

		checkContract({
			currentState: IcoStates.VipPlacement,
			totalBalance: bnWr(new BigNumber(0)),
			totalSupply: CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT,
			totalBought: bnWr(new BigNumber(0)),
			rate: bnWr(new BigNumber(0)),
		});
	});

	/**
	 * Тест, что нельзя передавать токенов больше чем есть
	 */
	it('test-transfer-tokens-overflow', () => {

		// Кол-во оставшихся токенов + 1
		let count = bnWr(contract.vipPlacementNotDistributed().plus(1));

		// Пытаемся передать VIP токенов больше чем осталось
		let res = execInEth(() => contract.transfer(accs.user1, count, txParams(accs.owner)));
		assert.ok(!res);

		let contractRmTokens = bnWr(contract.balanceOf(accs.owner));
		let user1RmTokens = bnWr(contract.balanceOf(accs.user1));

		// Ничего не должно измениться
		assert.ok(contractRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
		assert.ok(user1RmTokens.equals(0));

		checkContract({
			totalBought: bnWr(new BigNumber(0)),
			vipPlacementNotDistributed: CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT
		});
	});

	/**
	 * Тест распределения токенов между юзерами
	 */
	it('test-transfer-3-distribution', () => {

		let contractBalance = bnWr(contract.balanceOf(accs.owner));
		let sum1 = bnWr(contractBalance.dividedToIntegerBy(4));
		let sum2 = bnWr(contractBalance.dividedToIntegerBy(4));

		// user1 получает 1/4 rmToken
		// user2 получает 1/4 rmToken
		let res1 = execInEth(() => contract.transfer(accs.user1, sum1, txParams(accs.owner)));
		let res2 = execInEth(() => contract.transfer(accs.user2, sum2, txParams(accs.owner)));
		assert.ok(res1);
		assert.ok(res2);

		// Проверяем, что монеты успешно переведены
		let contractRmTokens = bnWr(contract.balanceOf(accs.owner));
		let user1RmTokens = bnWr(contract.balanceOf(accs.user1));
		let user2RmTokens = bnWr(contract.balanceOf(accs.user2));

		let remainingCoins = CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(sum1.plus(sum2));
		assert.ok(contractRmTokens.equals(remainingCoins));
		assert.ok(user1RmTokens.equals(sum1));
		assert.ok(user2RmTokens.equals(sum2));

		// пытаемся перечислить оставшиеся монеты + 1
		let res3 = execInEth(() => contract.transfer(accs.user1, remainingCoins.plus(1), txParams(accs.owner)));
		assert(!res3);

		// Ничего не должно измениться
		assert.ok(contractRmTokens.equals(remainingCoins));
		assert.ok(user1RmTokens.equals(sum1));
		assert.ok(user2RmTokens.equals(sum2));
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
		let priceRes = bnWr(contract.balanceOf(addr));
		assert.ok(priceRes.equals(CONSTANTS.PRIZE_SIZE_FORGOTO));
	});

	/**
	 * Тест перехода стадий PreSale -> SaleStage1
	 */
	it('test-goToState-saleStage1', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);

		// Проверяем, что мы на стадии PreSale
		assert.ok(contract.currentState().equals(IcoStates.PreSale));

		// Ждем пока нельзя переходить на SaleStage1
		while (!contract.canGotoState(IcoStates.SaleStage1)) {
			U.delay(1000);
		}

		// Дергаем ручку
		let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(addr)));
		assert.ok(res);

		// Должны быть на стадии SaleStage1
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		//Проверяем, что получили приз
		let priceRes = bnWr(contract.balanceOf(addr));
		assert.ok(priceRes.equals(CONSTANTS.PRIZE_SIZE_FORGOTO));
	});

	/**
	 * Тест перехода стадий SaleStage1 -> SaleStage2
	 */
	it('test-goToState-saleStage2', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage2
		checkContract({
			currentState: IcoStates.SaleStage2,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE2
		});
	});

	/**
	 * Тест перехода стадий SaleStage2 -> SaleStage3
	 */
	it('test-goToState-saleStage3', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);

		// Проверяем, что мы на стадии SaleStage2
		assert.ok(contract.currentState().equals(IcoStates.SaleStage2));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage3
		checkContract({
			currentState: IcoStates.SaleStage3,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE3
		});
	});

	/**
	 * Тест перехода стадий SaleStage3 -> SaleStage4
	 */
	it('test-goToState-saleStage4', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);

		// Проверяем, что мы на стадии SaleStage3
		assert.ok(contract.currentState().equals(IcoStates.SaleStage3));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage4
		checkContract({
			currentState: IcoStates.SaleStage4,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE4
		});
	});

	/**
	 * Тест перехода стадий SaleStage4 -> SaleStage5
	 */
	it('test-goToState-saleStage5', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);

		// Проверяем, что мы на стадии SaleStage4
		assert.ok(contract.currentState().equals(IcoStates.SaleStage4));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage5
		checkContract({
			currentState: IcoStates.SaleStage5,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE5
		});
	});

	/**
	 * Тест перехода стадий SaleStage5 -> SaleStage6
	 */
	it('test-goToState-saleStage6', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);

		// Проверяем, что мы на стадии SaleStage5
		assert.ok(contract.currentState().equals(IcoStates.SaleStage5));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage6
		checkContract({
			currentState: IcoStates.SaleStage6,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE6
		});
	});

	/**
	 * Тест перехода стадий SaleStage6 -> SaleStage7
	 */
	it('test-goToState-saleStage7', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);
		await goToState(IcoStates.SaleStage6);

		// Проверяем, что мы на стадии SaleStage6
		assert.ok(contract.currentState().equals(IcoStates.SaleStage6));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage7
		checkContract({
			currentState: IcoStates.SaleStage7,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE7
		});
	});

	/**
	 * Тест, что юзеры не могут передать свои токены до PostIco
	 */
	it('test-cannot-transfer-tokens-before-postIco', () => {

		// Сумма, которую будем покупать, передавать
		let sum = bnWr(new BigNumber(1));
		let bUser1, bUser2;

		// Передаем tokens юзеру
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
	it('test-buy-on-preSale', async () => {

		let user = accs.user1;
		await goToState(IcoStates.PreSale);

		// Свободные токены должны быть в ко-ве эмиссии
		checkContract({
			freeMoney: CONSTANTS.EMISSION_FOR_PRESALE,
			totalBought: bnWr(new BigNumber(0))
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
			freeMoney: bnWr(CONSTANTS.EMISSION_FOR_PRESALE.minus(count)),
			totalBought: count
		});
	});

	/**
	 * Вспомагательная функция проверяет значения полей контракта
	 * @param params Параметры для проверки
	 */
	function checkContract(params: CheckContractParams) {

		for (let key in params) {

			let value = bnWr((<any>contract)[key]());
			let expected = (<any>params)[key];

			assertEq(expected, value, key);
		}
	}

	/**
	 * Вспомагательный метод для вызова методов контракта
	 * @param {() => string} act Вызов метода контракта
	 * @returns {boolean} Успешность вызова
	 */
	function execInEth(act: () => string) {
		let txHash = null;
		try {
			txHash = act();
		} catch (err) {
			return false;
		}
		while (web3.eth.getTransactionReceipt(txHash) == null) {
		}

		let txRec = web3.eth.getTransactionReceipt(txHash);
		let tx = web3.eth.getTransaction(txHash);
		if (txRec.blockNumber == null || tx.blockNumber == null) {
			throw `${txRec.blockNumber} - ${tx.blockNumber}`;
		}

		return tx.gas > txRec.gasUsed;
	}

	//<editor-fold desc="goToStage">

	/**
	 * Вспомагательный метод для перехода на стадию
	 * @param {BigNumber.BigNumber} stage Стадия для перехода
	 * @returns {Promise<void>}
	 */
	async function goToState(stage: BigNumber.BigNumber): Promise<void> {

		//Если текущая или уже была, выходим
		if(contract.currentState().lessThanOrEqualTo(stage)) return;

		console.log("goToState: " + stage);

		// PreSale и SaleStage1
		if (stage.equals(IcoStates.PreSale) || stage.equals(IcoStates.SaleStage1)) {

			// Достаточно дождаться и дернуть ручку
			while (!contract.canGotoState(IcoStates.SaleStage1)) {
				await U.delay(1000);
			}

			let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(accs.lucky)));

			assert.ok(res);

			return;
		}

		// SaleStage2 - SaleStage7
		else if (stage.equals(IcoStates.SaleStage2) ||
			stage.equals(IcoStates.SaleStage3) ||
			stage.equals(IcoStates.SaleStage4) ||
			stage.equals(IcoStates.SaleStage5) ||
			stage.equals(IcoStates.SaleStage6) ||
			stage.equals(IcoStates.SaleStage7)) {

			// Необходимо выкупить freemoney
			let rate = bnWr(contract.rate());
			let freeMoney = bnWr(contract.freeMoney());

			//Считаем сколько надо eth на выкуп всего
			let ethCountWei = bnWr(freeMoney.divToInt(rate));

			// Выполняем покупку
			let res = execInEth(() => contract.buyTokens(accs.lucky, txParams(accs.lucky, ethCountWei)));
			assert.ok(res);
			return;
		}
	}

	//</editor-fold>

	/**
	 * Вспомагательный метод для проверки равенства значений BigNumber
	 * @param {BigNumber.BigNumber} expected Ожидаемое значение
	 * @param {BigNumber.BigNumber} value Текущее значение
	 */
	function assertEq(expected: BigNumber.BigNumber, value: BigNumber.BigNumber, message?: string): void {
		assert.ok(expected.equals(value), (message + " expected: " + expected + " value: " + value).trim());
	}

});