import "mocha";
import * as assert from "assert";
import {BigNumber} from "bignumber.js";
import * as Web3 from "web3";
import {U} from "./u";
import {Config} from "./config";
import {ContractConstants} from "./contract-constants";
import {IcoStates} from "./ico-states";
import {bnWr, BnWr} from "./bn-wr";
import {TestAccounts, prepare} from "./prepare-test-data";
import {deploy} from "./deploy-to-target";
import {Contract, txParams} from "./contract";
import {deploy as deployTest} from "./delpoy-test-contracts";

//add extra mocha options: --require ts-node/register --timeout 100000

let web3: any;
let contract: Contract;
let config: Config = null;
let accs: TestAccounts;
let CONSTANTS: ContractConstants;
let emptyAddress: '0x0000000000000000000000000000000000000000';

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
	rate?: BnWr;
	unsoldTokens?: BnWr;
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
		let c = await deploy(config.rpcAddress, accs.deployer, config.accountPass, accs.owner, accs.coOwner, accs.bounty, accs.team);

		contract = web3.eth.contract(c.abi).at(c.address);
		CONSTANTS = new ContractConstants(contract);

		// Разлочиваем все счета
		unlockAll();
	});

	/**
	 * Тест для проверки отправки токенов контракту
	 */
	it('test-transfer-all-to-contract', async () => {

		let contractReceiver = await getContractReceiver();

		// Передаем токены контракту
		let res = await execInEth(() => contract.transfer(contractReceiver.address, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, txParams(accs.owner)));

		let ownerRmTokens = bnWr(contract.balanceOf(accs.owner));
		let contractReceiverRmTokens = bnWr(contract.balanceOf(contractReceiver.address));

		let contractReceiverData = getContractReceiverData(contractReceiver);

		assert.ok(res);
		assert.ok(ownerRmTokens.equals(0));
		assert.ok(contractReceiverRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));

		assert.ok(contractReceiverData.sender == accs.owner);
		assertEq(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, contractReceiverData.value);
	});

	/**
	 * Тест для проверки отправки токенов контракту который не поддерживает erc223
	 */
	it('test-transfer-all-to-not-erc223-contract', async () => {

		let contractReceiver = await getContractReceiverNotForErc223();

		// Передаем токены контракту
		let res = await execInEth(() => contract.transfer(contractReceiver.address, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, txParams(accs.owner)));

		let ownerRmTokens = bnWr(contract.balanceOf(accs.owner));
		let contractReceiverRmTokens = bnWr(contract.balanceOf(contractReceiver.address));

		//Контракт ничего не должен получить
		assert.ok(!res);
		assert.ok(ownerRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
		assert.ok(contractReceiverRmTokens.equals(0));
	});

	/**
	 * Тест для проверки отправки токенов контракту c ошибкой
	 */
	it('test-transfer-to-contract-fallbackError', async () => {

		let contractReceiver = await getContractReceiverWithError();

		let before = getContractReceiverData(contractReceiver);

		// Передаем токены контракту
		let res = await execInEth(() => contract.transfer(contractReceiver.address, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, txParams(accs.owner)));

		let ownerRmTokens = bnWr(contract.balanceOf(accs.owner));
		let contractReceiverRmTokens = bnWr(contract.balanceOf(contractReceiver.address));

		let after = getContractReceiverData(contractReceiver);

		// Проверяем, что ничего не изменилось
		assert.ok(!res);
		assert.ok(ownerRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
		assert.ok(contractReceiverRmTokens.equals(0));

		assert.ok(before.sender == after.sender);
		assertEq(before.value, after.value);
		assert.ok(before.data == after.data);
	});

	/**
	 * Тест для проверки отправки токенов c данными контракту
	 */
	it('test-transfer-all-with-data-to-contract', async () => {

		let contractReceiver = await getContractReceiver();

		// Передаем токены контракту
		let data = "0x010203";
		let res = await execInEth(() => (<any>contract).test_transferWithData(contractReceiver.address, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, data, txParams(accs.owner)));

		let ownerRmTokens = bnWr(contract.balanceOf(accs.owner));
		let contractReceiverRmTokens = bnWr(contract.balanceOf(contractReceiver.address));

		let after = getContractReceiverData(contractReceiver);

		assert.ok(res);
		assert.ok(ownerRmTokens.equals(0));
		assert.ok(contractReceiverRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));

		assert.ok(after.sender == accs.owner);
		assertEq(after.value, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT);
		assert.ok(after.data == data);
	});

	/**
	 * Тест для проверки отправки токенов c данными контракту c ошибкой
	 */
	it('test-transfer-all-with-data-to-contract-fallbackError', async () => {

		let contractReceiver = await getContractReceiverWithError();

		let before = getContractReceiverData(contractReceiver);

		// Передаем токены контракту
		let data = "0x010203";
		let res = await execInEth(() => (<any>contract).test_transferWithData(contractReceiver.address, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, data, txParams(accs.owner)));

		let ownerRmTokens = bnWr(contract.balanceOf(accs.owner));
		let contractReceiverRmTokens = bnWr(contract.balanceOf(contractReceiver.address));

		let after = getContractReceiverData(contractReceiver);

		// Проверяем, что ничего не изменилось
		assert.ok(!res);
		assert.ok(ownerRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
		assert.ok(contractReceiverRmTokens.equals(0));

		assert.ok(before.sender == after.sender);
		assertEq(before.value, after.value);
		assert.ok(before.data == after.data);
	});

	/**
	 * Тест для проверки начального состояния контракта
	 */
	it('test-contract-init', async () => {

		checkContract({
			currentState: IcoStates.VipPlacement,
			totalBalance: bnWr(new BigNumber(0)),
			totalSupply: bnWr(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.plus(CONSTANTS.EMISSION_FOR_BOUNTY).plus(CONSTANTS.EMISSION_FOR_TEAM)),
			totalBought: bnWr(new BigNumber(0)),
			rate: bnWr(new BigNumber(0)),
		});

		//Проверяем, что была выполнена эмиссия и монеты переданы на кошелек владельца
		let balance = bnWr(contract.balanceOf(accs.owner));
		assertEq(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, balance);
	});

	/**
	 * Тест деплоя контракта
	 */
	it('test-deploy', async () => {

		// Деплой контракта выполняется 3-м лицом - он не совпадает ни с одним адресом указанным в конструкторе - владелец, совладелец, адреса баунти и тим

		// Проверяем, что нельзя задеплоить от: ownerm coOwner, team, bounty
		for (let acc in [accs.owner, accs.coOwner, accs.bounty, accs.team]) {
			try {
				let c = await deploy(config.rpcAddress, acc, config.accountPass, accs.owner, accs.coOwner, accs.bounty, accs.team);
				assert.fail("Контракт не должен был быть задеплоен")
			}
			catch (e) {
				console.log(e.message);
			}
		}
	});

	//Деплой контракта выполняется 3-м лицом - он не совпадает ни с одним адресом указанным в конструкторе - владелец, совладелец, адреса баунти и тим

	/**
	 * Тест проверяющий значения enum IcoStates
	 */
	it('test-checkIcoStates', async () => {

		//Проверяем значения enum
		assertEq(new BigNumber(0), IcoStates.VipPlacement);
		assertEq(new BigNumber(1), IcoStates.PreSale);
		assertEq(new BigNumber(2), IcoStates.SaleStage1);
		assertEq(new BigNumber(3), IcoStates.SaleStage2);
		assertEq(new BigNumber(4), IcoStates.SaleStage3);
		assertEq(new BigNumber(5), IcoStates.SaleStage4);
		assertEq(new BigNumber(6), IcoStates.SaleStage5);
		assertEq(new BigNumber(7), IcoStates.SaleStage6);
		assertEq(new BigNumber(8), IcoStates.SaleStage7);
		assertEq(new BigNumber(9), IcoStates.SaleStageLast);
		assertEq(new BigNumber(10), IcoStates.PostIco);

		// Проходим по стадиям и проверяем currentState
		assertEq(IcoStates.VipPlacement, contract.currentState());

		await goToState(IcoStates.PreSale, false);
		assertEq(IcoStates.PreSale, contract.currentState());

		await goToState(IcoStates.SaleStage1, false);
		assertEq(IcoStates.SaleStage1, contract.currentState());

		await goToState(IcoStates.SaleStage2, false);
		assertEq(IcoStates.SaleStage2, contract.currentState());

		await goToState(IcoStates.SaleStage3, false);
		assertEq(IcoStates.SaleStage3, contract.currentState());

		await goToState(IcoStates.SaleStage4, false);
		assertEq(IcoStates.SaleStage4, contract.currentState());

		await goToState(IcoStates.SaleStage5, false);
		assertEq(IcoStates.SaleStage5, contract.currentState());

		await goToState(IcoStates.SaleStage6, false);
		assertEq(IcoStates.SaleStage6, contract.currentState());

		await goToState(IcoStates.SaleStage7, false);
		assertEq(IcoStates.SaleStage7, contract.currentState());

		await goToState(IcoStates.SaleStageLast, false);
		assertEq(IcoStates.SaleStageLast, contract.currentState());

		await goToState(IcoStates.PostIco, false);
		assertEq(IcoStates.PostIco, contract.currentState());
	});

	/**
	 * Тест перехода на след. стадию
	 */
	it('test-gotoNextState', async () => {

		// Достаточно дождаться и дернуть ручку
		while (!contract.canGotoState(IcoStates.PreSale)) {
			await U.delay(1000);
		}

		// Выполнять переход на след. стадию с помощью GoToNextStage может только owner

		let allButNotOwner = Object.keys(accs)
			.map(x => (<any>accs)[x])
			.filter(x => x != accs.owner);

		for (let acc in allButNotOwner) {
			let res = await execInEth(() => contract.gotoNextState(txParams(acc)));
			let state = bnWr(contract.currentState());

			assert.ok(!res);
			assertEq(IcoStates.VipPlacement, state);
		}

		// Owner может выполнить переход
		let res = await execInEth(() => contract.gotoNextState(txParams(accs.owner)));
		let state = bnWr(contract.currentState());
		assert.ok(res);
		assertEq(IcoStates.PreSale, state);
	});

	/**
	 * Тест передачи всех токенов одному юзеру
	 */
	it('test-transfer-all', async () => {

		// Передаем все имеющиеся токены одному юзеру
		let res = await execInEth(() => contract.transfer(accs.user1, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT, txParams(accs.owner)));
		assert.ok(res);

		let contractRmTokens = bnWr(contract.balanceOf(accs.owner));
		let user1RmTokens = bnWr(contract.balanceOf(accs.user1));

		assert.ok(contractRmTokens.equals(0));
		assert.ok(user1RmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));

		checkContract({
			currentState: IcoStates.VipPlacement,
			totalBalance: bnWr(new BigNumber(0)),
			totalSupply: bnWr(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.plus(CONSTANTS.EMISSION_FOR_BOUNTY).plus(CONSTANTS.EMISSION_FOR_TEAM)),
			totalBought: bnWr(new BigNumber(0)),
			rate: bnWr(new BigNumber(0)),
		});
	});

	/**
	 * Тест, что нельзя передавать токенов больше чем есть
	 */
	it('test-transfer-tokens-overflow', async () => {

		// Кол-во оставшихся токенов + 1
		let count = bnWr(contract.vipPlacementNotDistributed().plus(1));

		// Пытаемся передать VIP токенов больше чем осталось
		let res = await execInEth(() => contract.transfer(accs.user1, count, txParams(accs.owner)));
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
	 * Тест распределения токенов между юзерами на стадии VipPlacement
	 */
	it('test-transfer-tokens-distribution-on-vipPlacement', async () => {

		await testTransferTokensDistributionOnStage(IcoStates.VipPlacement);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии PreSale
	 */
	it('test-transfer-tokens-distribution-on-preSale', async () => {

		await goToState(IcoStates.PreSale);
		await testTransferTokensDistributionOnStage(IcoStates.PreSale);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage1
	 */
	it('test-transfer-tokens-distribution-on-saleStage1', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await testTransferTokensDistributionOnStage(IcoStates.SaleStage1);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage2
	 */
	it('test-transfer-tokens-distribution-on-saleStage2', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage2);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage3
	 */
	it('test-transfer-tokens-distribution-on-saleStage3', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage3);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage4
	 */
	it('test-transfer-tokens-distribution-on-saleStage4', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage4);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage5
	 */
	it('test-transfer-tokens-distribution-on-saleStage5', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage5);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage6
	 */
	it('test-transfer-tokens-distribution-on-saleStage6', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);
		await goToState(IcoStates.SaleStage6);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage6);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStage7
	 */
	it('test-transfer-tokens-distribution-on-saleStage7', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);
		await goToState(IcoStates.SaleStage6);
		await goToState(IcoStates.SaleStage7);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStage7);
	});

	/**
	 * Тест распределения токенов между юзерами на стадии SaleStageLast
	 */
	it('test-transfer-tokens-distribution-on-saleStageLast', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		await goToState(IcoStates.SaleStage2);
		await goToState(IcoStates.SaleStage3);
		await goToState(IcoStates.SaleStage4);
		await goToState(IcoStates.SaleStage5);
		await goToState(IcoStates.SaleStage6);
		await goToState(IcoStates.SaleStage7);
		await goToState(IcoStates.SaleStageLast);

		await testTransferTokensDistributionOnStage(IcoStates.SaleStageLast);
	});

	/**
	 * Вспомагательный метод для тестирования распределения токенов между юзерами на стадии
	 * @param {BigNumber} stage Стадия на которой тестируем
	 * @returns {Promise<void>}
	 */
	async function testTransferTokensDistributionOnStage(stage: BigNumber): Promise<void> {

		assert.ok(contract.currentState().equals(stage));

		//-----------------------------------------------
		let ownerTokenBalance = bnWr(contract.balanceOf(accs.owner));
		let sumToken1 = bnWr(new BigNumber(11));
		let sumToken2 = bnWr(new BigNumber(22));

		let user1Tokens = bnWr(contract.balanceOf(accs.user1));
		let user2Tokens = bnWr(contract.balanceOf(accs.user2));

		// user1 получает 1/8 ownerTokenBalance
		// user2 получает 1/8 ownerTokenBalance
		let res1 = await execInEth(() => contract.transfer(accs.user1, sumToken1, txParams(accs.owner)));
		let res2 = await execInEth(() => contract.transfer(accs.user2, sumToken2, txParams(accs.owner)));
		assert.ok(res1);
		assert.ok(res2);

		// Проверяем, что монеты успешно переведены
		let ownerTokenBalanceAfterTransfer = bnWr(contract.balanceOf(accs.owner));
		let user1TokensAfterTransfer = bnWr(contract.balanceOf(accs.user1));
		let user2TokensAfterTransfer = bnWr(contract.balanceOf(accs.user2));

		assert.ok(ownerTokenBalanceAfterTransfer.equals(ownerTokenBalance.minus(sumToken1).minus(sumToken2)));
		assert.ok(user1TokensAfterTransfer.equals(user1Tokens.plus(sumToken1)));
		assert.ok(user2TokensAfterTransfer.equals(user2Tokens.plus(sumToken2)));

		//-----------------------------------------------
		// Пытаемся перечислить оставшиеся монеты + 1
		let res3 = await execInEth(() => contract.transfer(accs.user1, ownerTokenBalanceAfterTransfer.plus(1), txParams(accs.owner)));
		assert(!res3);

		// Ничего не должно измениться
		let ownerTokenBalanceAfterTransferErr = bnWr(contract.balanceOf(accs.owner));
		assert.ok(ownerTokenBalanceAfterTransferErr.equals(ownerTokenBalanceAfterTransfer));
		assert.ok(contract.balanceOf(accs.user1).equals(user1TokensAfterTransfer));
		assert.ok(contract.balanceOf(accs.user2).equals(user2TokensAfterTransfer));

		//-----------------------------------------------
		// Пытаемся передать токены на аккаунт bounty
		let resBounty = await execInEth(() => contract.transfer(accs.bounty, new BigNumber(1), txParams(accs.owner)));
		assert(!resBounty);

		// Ничего не должно измениться
		let ownerTokenBalanceAfterTransferToBounty = bnWr(contract.balanceOf(accs.owner));
		assert.ok(ownerTokenBalanceAfterTransferToBounty.equals(ownerTokenBalanceAfterTransfer));
		assertEq(CONSTANTS.EMISSION_FOR_BOUNTY, contract.balanceOf(accs.bounty));

		//-----------------------------------------------
		// Пытаемся передать токены на аккаунт team
		let resTeam = await execInEth(() => contract.transfer(accs.team, new BigNumber(1), txParams(accs.owner)));
		assert(!resTeam);

		// Ничего не должно измениться
		let ownerTokenBalanceAfterTransferToTeam = bnWr(contract.balanceOf(accs.owner));
		assert.ok(ownerTokenBalanceAfterTransferToTeam.equals(ownerTokenBalanceAfterTransfer));
		assertEq(CONSTANTS.EMISSION_FOR_TEAM, contract.balanceOf(accs.team));

		//-----------------------------------------------
		// Распределяем bounty токены
		let bountyRes = await execInEth(() => contract.transferBounty(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(bountyRes);

		// Распределять может только владелец
		let bountyResErr = await execInEth(() => contract.transferBounty(accs.user1, new BigNumber(1), txParams(accs.user1)));
		assert.ok(!bountyResErr);

		//Распределять можно на любые аккаунты в т.ч. на team
		let bountyToTeamRes = await execInEth(() => contract.transferBounty(accs.team, new BigNumber(1), txParams(accs.owner)));
		assert.ok(bountyToTeamRes);

		//Нельзя распределять на аккаунт владельца контракта
		let bountyToOwnerRes = await execInEth(() => contract.transferBounty(accs.owner, new BigNumber(1), txParams(accs.owner)));
		assert.ok(!bountyToOwnerRes);


		//-----------------------------------------------
		// Распределяем team токены
		let teamRes = await execInEth(() => contract.transferTeam(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(teamRes);

		// Распределять может только владелец
		let teamResErr = await execInEth(() => contract.transferTeam(accs.user1, new BigNumber(1), txParams(accs.user1)));
		assert.ok(!teamResErr);

		//Распределять можно на любые аккаунты в т.ч. на bounty
		let teamToBountyRes = await execInEth(() => contract.transferTeam(accs.bounty, new BigNumber(1), txParams(accs.owner)));
		assert.ok(teamToBountyRes);

		//Нельзя распределять на аккаунт владельца контракта
		let teamToOwnerRes = await execInEth(() => contract.transferTeam(accs.owner, new BigNumber(1), txParams(accs.owner)));
		assert.ok(!teamToOwnerRes);

	}

	/**
	 * Тест перехода стадий VipPlacement -> PreSale
	 */
	it('test-goToState-preSale', async () => {

		let addr = accs.user1;

		// Проверяем, что мы на стадии VipPlacement
		assert.ok(contract.currentState().equals(IcoStates.VipPlacement));

		// Ждем пока нельзя переходить на PreSale
		while (!contract.canGotoState(IcoStates.PreSale)) {
		}

		// Дергаем ручку
		let res = await execInEth(() => contract.gotoNextState(txParams(accs.owner)));
		assert.ok(res);

		// Должны быть на стадии PreSale
		checkContract({
			currentState: IcoStates.PreSale,
			freeMoney: CONSTANTS.EMISSION_FOR_PRESALE,
			totalBought: bnWr(new BigNumber(0)),
			rate: CONSTANTS.RATE_PRESALE
		});
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
			await U.delay(1000);
		}

		// Дергаем ручку
		let res = await execInEth(() => contract.gotoNextState(txParams(accs.owner)));
		assert.ok(res);

		// Должны быть на стадии SaleStage1
		checkContract({
			currentState: IcoStates.SaleStage1,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE1,
			rate: CONSTANTS.RATE_SALESTAGE1
		});

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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage2
		checkContract({
			currentState: IcoStates.SaleStage2,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE2,
			rate: CONSTANTS.RATE_SALESTAGE2
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
		let currState = contract.currentState();
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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage3
		checkContract({
			currentState: IcoStates.SaleStage3,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE3,
			rate: CONSTANTS.RATE_SALESTAGE3
		});
	});

	/**
	 * Тест перехода стадий SaleStage3 -> SaleStage4
	 */
	it('test-goToState-saleStage4', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage4
		checkContract({
			currentState: IcoStates.SaleStage4,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE4,
			rate: CONSTANTS.RATE_SALESTAGE4
		});
	});

	/**
	 * Тест перехода стадий SaleStage4 -> SaleStage5
	 */
	it('test-goToState-saleStage5', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
		//await goToState(IcoStates.SaleStage3);
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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage5
		checkContract({
			currentState: IcoStates.SaleStage5,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE5,
			rate: CONSTANTS.RATE_SALESTAGE5
		});
	});

	/**
	 * Тест перехода стадий SaleStage5 -> SaleStage6
	 */
	it('test-goToState-saleStage6', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
		//await goToState(IcoStates.SaleStage3);
		//await goToState(IcoStates.SaleStage4);
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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage6
		checkContract({
			currentState: IcoStates.SaleStage6,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE6,
			rate: CONSTANTS.RATE_SALESTAGE6
		});
	});

	/**
	 * Тест перехода стадий SaleStage6 -> SaleStage7
	 */
	it('test-goToState-saleStage7', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
		//await goToState(IcoStates.SaleStage3);
		//await goToState(IcoStates.SaleStage4);
		//await goToState(IcoStates.SaleStage5);
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
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage7
		checkContract({
			currentState: IcoStates.SaleStage7,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE7,
			rate: CONSTANTS.RATE_SALESTAGE7
		});
	});

	/**
	 * Тест перехода стадий SaleStage7 -> SaleStageLast
	 */
	it('test-goToState-saleStageLast', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
		//await goToState(IcoStates.SaleStage3);
		//await goToState(IcoStates.SaleStage4);
		//await goToState(IcoStates.SaleStage5);
		//await goToState(IcoStates.SaleStage6);
		await goToState(IcoStates.SaleStage7);

		// Проверяем, что мы на стадии SaleStage7
		assert.ok(contract.currentState().equals(IcoStates.SaleStage7));

		// Необходимо все выкупить
		let rate = bnWr(contract.rate());
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());

		//Считаем сколько надо eth на выкуп всего
		let ethCountWei = bnWr(freeMoney.divToInt(rate));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyFreeMoneyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyFreeMoneyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(freeMoney, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на SaleStageLast
		checkContract({
			currentState: IcoStates.SaleStageLast,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGELAST,
			rate: CONSTANTS.RATE_SALESTAGELAST
		});
	});

	/**
	 * Тест перехода стадий SaleStageLast -> PostIco
	 */
	it('test-goToState-postIco', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//await goToState(IcoStates.SaleStage2);
		//await goToState(IcoStates.SaleStage3);
		//await goToState(IcoStates.SaleStage4);
		//await goToState(IcoStates.SaleStage5);
		//await goToState(IcoStates.SaleStage6);
		//await goToState(IcoStates.SaleStage7);
		await goToState(IcoStates.SaleStageLast);

		// Проверяем, что мы на стадии SaleStageLast
		assert.ok(contract.currentState().equals(IcoStates.SaleStageLast));

		// Достаточно дождаться времени завершения SaleStageLast
		while (!contract.canGotoState(IcoStates.PostIco)) {
			await U.delay(1000);
		}

		let before = {
			freeMoney: bnWr(contract.freeMoney()),
			startDateOfRestoreUnsoldTokens: toDateTimeUtc(contract.startDateOfRestoreUnsoldTokens())
		};

		// Дергаем ручку
		let res = await execInEth(() => contract.gotoNextState(txParams(accs.owner)));
		assert.ok(res);

		let after = {
			freeMoney: bnWr(contract.freeMoney()),
			startDateOfRestoreUnsoldTokens: toDateTimeUtc(contract.startDateOfRestoreUnsoldTokens())
		};

		// Проверяем, что произошел переход на PostIco
		checkContract({
			currentState: IcoStates.PostIco,
			freeMoney: bnWr(new BigNumber(0)),
			rate: bnWr(new BigNumber(0)),
			unsoldTokens: before.freeMoney
		});

		assert.ok(U.getUtcNow() < after.startDateOfRestoreUnsoldTokens);
	});

	/**
	 * Тест распределения средств на стадии PostIco
	 */
	it('test-postIco-distribution', async () => {

		//Распределяем токены
		let tx = await execInEth(() => contract.transfer(accs.user1, new BigNumber(100), txParams(accs.owner)));
		assert.ok(tx);

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//...
		await goToState(IcoStates.SaleStageLast);
		await goToState(IcoStates.PostIco);

		// Проверяем, что мы на стадии PostIco
		assert.ok(contract.currentState().equals(IcoStates.PostIco));

		//-----------------------------------------------
		// На PostIco можно распределять bounty и team токены
		// Bounty
		let beforeTransferBountyCount = bnWr(contract.balanceOf(accs.user1));
		let transferBounty = await execInEth(() => contract.transferBounty(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(transferBounty);
		assertEq(bnWr(beforeTransferBountyCount.plus(1)), bnWr(contract.balanceOf(accs.user1)));
		// Team
		let tranfserTeam = await execInEth(() => contract.transferTeam(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(tranfserTeam);
		assertEq(bnWr(beforeTransferBountyCount.plus(1)), bnWr(contract.balanceOf(accs.user1)));

		//-----------------------------------------------
		// Покупка токенов запрещена
		let user1TokensCountBefore = contract.balanceOf(accs.user1);
		let buyErr = await execInEth(() => contract.buyTokens(accs.user1, txParams(accs.user1, new BigNumber(1))));
		assert.ok(!buyErr);
		assert.ok(user1TokensCountBefore.equals(contract.balanceOf(accs.user1)));

		//-----------------------------------------------
		// Все владельцы кошельков могут переводить RBM кому угодно
		let user1TokensBeforeTransfer = bnWr(contract.balanceOf(accs.user1));
		let user2TokensBeforeTransfer = bnWr(contract.balanceOf(accs.user2));
		let transCount = bnWr(new BigNumber(1));

		// Transfer User1 -> User2
		let trans = await execInEth(() => contract.transfer(accs.user2, transCount, txParams(accs.user1)));

		let user1TokensAfterTransfer = bnWr(contract.balanceOf(accs.user1));
		let user2TokensAfterTransfer = bnWr(contract.balanceOf(accs.user2));

		assert.ok(trans);
		assert.ok(user1TokensBeforeTransfer.equals(user1TokensAfterTransfer.plus(transCount)));
		assert.ok(user2TokensBeforeTransfer.equals(user2TokensAfterTransfer.minus(transCount)));

		//-----------------------------------------------

		// Можно переводить на баунти аккаунт
		let user1TokensBeforeTransferBounty = bnWr(contract.balanceOf(accs.user1));
		let bountyTokensBeforeTransferBounty = bnWr(contract.balanceOf(accs.bounty));
		let transferToBountyCount = bnWr(new BigNumber(10));

		// Transfer User1 -> Bounty
		let transBounty = await execInEth(() => contract.transfer(accs.bounty, transferToBountyCount, txParams(accs.user1)));

		let user1TokensAfterTransferBounty = bnWr(contract.balanceOf(accs.user1));
		let bountyTokensAfterTransferBounty = bnWr(contract.balanceOf(accs.bounty));

		assert.ok(transBounty);
		assert.ok(user1TokensBeforeTransferBounty.equals(user1TokensAfterTransferBounty.plus(transferToBountyCount)));
		assert.ok(bountyTokensBeforeTransferBounty.equals(bountyTokensAfterTransferBounty.minus(transferToBountyCount)));

		//-----------------------------------------------

		// Можно переводить на тим аккаунт
		let user1TokensBeforeTransferTeam = bnWr(contract.balanceOf(accs.user1));
		let teamTokensBeforeTransferTeam = bnWr(contract.balanceOf(accs.team));
		let transferToTeamCount = bnWr(new BigNumber(20));

		// Transfer User1 -> Team
		let transTeam = await execInEth(() => contract.transfer(accs.team, transferToTeamCount, txParams(accs.user1)));

		let user1TokensAfterTransferTeam = bnWr(contract.balanceOf(accs.user1));
		let teamTokensAfterTransferTeam = bnWr(contract.balanceOf(accs.team));

		assert.ok(transTeam);
		assert.ok(user1TokensBeforeTransferTeam.equals(user1TokensAfterTransferTeam.plus(transferToTeamCount)));
		assert.ok(teamTokensBeforeTransferTeam.equals(teamTokensAfterTransferTeam.minus(transferToTeamCount)));
	});

	/**
	 * Тест approve
	 */
	it('test-approve', async () => {

		//Распределяем токены
		let tx = await execInEth(() => contract.transfer(accs.user1, new BigNumber(100), txParams(accs.owner)));
		assert.ok(tx);

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//...
		await goToState(IcoStates.SaleStageLast);
		await goToState(IcoStates.PostIco);

		// Проверяем, что мы на стадии PostIco
		assert.ok(contract.currentState().equals(IcoStates.PostIco));
		// User2 не должен иметь монет
		assert.ok(await contract.transfer(accs.lucky, contract.balanceOf(accs.user2), txParams(accs.user2)));

		//-----------------------------------------------

		// Проверяем что ничего не заапрувлено
		assertEq(bnWr(new BigNumber(0)), bnWr(contract.allowance(accs.user1, accs.user2)));

		// User1 аппрувит 10 токенов User2
		let beforeApprove = {
			user1: bnWr(contract.balanceOf(accs.user1)),
			user2: bnWr(contract.balanceOf(accs.user2)),
		};
		let approveCount = bnWr(new BigNumber(10));
		let res1 = await execInEth(() => contract.approve(accs.user2, approveCount, txParams(accs.user1)));
		let afterApprove = {
			user1: bnWr(contract.balanceOf(accs.user1)),
			user2: bnWr(contract.balanceOf(accs.user2)),
		};
		assert.ok(res1);
		assertEq(beforeApprove.user1, afterApprove.user1);
		assertEq(beforeApprove.user2, afterApprove.user2);
		assertEq(approveCount, bnWr(contract.allowance(accs.user1, accs.user2)));


		// User2 выполняет перевод 5 RBM user1 -> lucky
		let transferCount = new BigNumber(5);
		let beforeTransfer = {
			user1: bnWr(contract.balanceOf(accs.user1)),
			user2: bnWr(contract.balanceOf(accs.user2)),
			lucky: bnWr(contract.balanceOf(accs.lucky)),
		};
		let res2 = await execInEth(() => contract.transferFrom(accs.user1, accs.lucky, transferCount, txParams(accs.user2)));
		let afterTransfer = {
			user1: bnWr(contract.balanceOf(accs.user1)),
			user2: bnWr(contract.balanceOf(accs.user2)),
			lucky: bnWr(contract.balanceOf(accs.lucky)),
		};
		assert.ok(res2);
		assertEq(beforeTransfer.user1, afterTransfer.user1.plus(transferCount));
		assertEq(beforeTransfer.user2, afterTransfer.user2);
		assertEq(beforeTransfer.lucky, afterTransfer.lucky.minus(transferCount));
		assertEq(bnWr(approveCount.minus(transferCount)), bnWr(contract.allowance(accs.user1, accs.user2)));

	});

	/**
	 * Тест accrueTeamTokens
	 */
	it('test-accrueTeamTokens', async () => {

		//Распределяем тим токены
		let teamCount = bnWr(new BigNumber(100));
		let tx = await execInEth(() => contract.transferTeam(accs.user1, teamCount, txParams(accs.owner)));
		assert.ok(tx);

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//...
		await goToState(IcoStates.SaleStageLast);
		await goToState(IcoStates.PostIco);

		// Проверяем, что мы на стадии PostIco
		assert.ok(contract.currentState().equals(IcoStates.PostIco));

		// Проверяем, что баланс 0
		assertEq(bnWr(new BigNumber(0)), bnWr(contract.balanceOf(accs.user1)));

		// Проверяем, что есть team токены ожидающие зачисления
		assertEq(teamCount, bnWr(contract.teamBalanceOf(accs.user1)));

		// Проверяем, что не наступила дата с которой можно получить токены
		let dtUtc = toDateTimeUtc(contract.startDateOfUseTeamTokens());
		let nowUtc = U.getUtcNow();

		let nowUtcTicks = nowUtc.getTime();
		let tdUtcTicks = dtUtc.getTime();

		assert.ok(nowUtcTicks < tdUtcTicks);

		// Пробуем получить токены
		let accrueErr = await execInEth(() => contract.accrueTeamTokens(txParams(accs.user1)));
		assert.ok(!accrueErr);

		// Дожидаемся, когда можно зачислить team токены
		while (U.getUtcNow() < toDateTimeUtc(contract.startDateOfUseTeamTokens())) {
			await U.delay(1000);
		}

		// Получаем тим токены
		let accrue = await execInEth(() => contract.accrueTeamTokens(txParams(accs.user1)));
		assert.ok(accrue);

		// Проверяем баланс
		let balance = bnWr(contract.balanceOf(accs.user1));
		assertEq(teamCount, balance);

		// Проверяем, что нет team токенов ожидающих зачисления
		assertEq(bnWr(new BigNumber(0)), bnWr(contract.teamBalanceOf(accs.user1)));
	});

	/**
	 * Тест покупки на Stage1 монет больше, чем выпущено для Stage1
	 */
	it('test-buy-more-than-was-emissioned-on-stage1', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		let currStage = contract.currentState();
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Будем покупать больше, чем есть freeMoney на Stage1

		// Необходимо все выкупить
		let rate1 = bnWr(contract.rate());
		let rate2 = CONSTANTS.RATE_SALESTAGE2;
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());
		let goingToBuyTokenCount = bnWr(freeMoney.plus(rate2));

		//Считаем сколько надо eth на покупку (freemoney / rate1) + 1 токенов
		let ethCountWei = bnWr(freeMoney.divToInt(rate1));
		ethCountWei = bnWr(ethCountWei.plus(1));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(goingToBuyTokenCount, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage2
		checkContract({
			currentState: IcoStates.SaleStage2,
			freeMoney: bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE2.minus(CONSTANTS.RATE_SALESTAGE2))
		});
	});

	/**
	 * Тест покупки на Stage1 монет больше, чем выпущено для Stage1 и Stage2
	 */
	it('test-buy-more-than-was-emissioned-on-stage1-and-stage2', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		let currStage = contract.currentState();
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Будем покупать больше, чем есть freeMoney на Stage1 и Stage2

		// Необходимо все выкупить
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());
		let goingToBuyTokenCount = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE1
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2)
			.plus(CONSTANTS.RATE_SALESTAGE3));

		//Считаем сколько надо eth на покупку (emission1 / rate1) + (emission2 / rate2) + 1 токенов
		let ethCountWei = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE1.divToInt(CONSTANTS.RATE_SALESTAGE1));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2.divToInt(CONSTANTS.RATE_SALESTAGE2)));
		ethCountWei = bnWr(ethCountWei.plus(1));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(goingToBuyTokenCount, userTokenBalanceAfterBuy);

		// Проверяем, что произошел переход на Stage3
		checkContract({
			currentState: IcoStates.SaleStage3,
			freeMoney: bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE3.minus(CONSTANTS.RATE_SALESTAGE3))
		});
	});

	/**
	 * Тест, что юзеры не могут передать свои токены до PostIco
	 */
	it('test-cannot-transfer-tokens-before-postIco', async () => {

		// Сумма, которую будем покупать, передавать
		let sum = bnWr(new BigNumber(1));
		let bUser1, bUser2;

		// Передаем tokens юзеру
		let res1 = await execInEth(() => contract.transfer(accs.user1, sum, txParams(accs.owner)));
		assert.ok(res1);

		// Проверяем баланс
		bUser1 = bnWr(contract.balanceOf(accs.user1));
		assert.ok(bUser1.equals(sum));

		// Юзер 1 пытается передать их юзеру 2
		let res2 = await execInEth(() => contract.transfer(accs.user2, sum, txParams(accs.user1)));
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
		let weiCount = bnWr(new BigNumber(1));

		// Считаем, сколько rmToken должны купить на 1 wei
		let count = bnWr(weiCount.mul(CONSTANTS.RATE_PRESALE));

		// Выполняем покупку
		let res = await execInEth(() => contract.buyTokens(user, txParams(user, weiCount)));
		assert.ok(res);

		// Проверяем что купили
		let userRmTokens = bnWr(contract.balanceOf(user));

		assert.ok(userRmTokens.equals(count));
		checkContract({
			freeMoney: bnWr(CONSTANTS.EMISSION_FOR_PRESALE.minus(count)),
			totalBought: count
		});

		//-----------------------------------------------

		// Пытаемся купить больше, чем осталось
		let freeMoney = bnWr(contract.freeMoney());
		let weiOverPrice = freeMoney.divToInt(CONSTANTS.RATE_PRESALE).plus(1);

		//Будем покупать на большую сумму, чтобы выйти за

		// Выполняем покупку
		let resErr = await execInEth(() => contract.buyTokens(user, txParams(user, weiOverPrice)));
		assert.ok(!resErr);

		// Ничего не должно измениться
		assertEq(userRmTokens, contract.balanceOf(user));
		checkContract({
			freeMoney: bnWr(CONSTANTS.EMISSION_FOR_PRESALE.minus(count)),
			totalBought: count
		});

		//-----------------------------------------------
		// Выкупаем токены в 0, проверяем, что остаемся на PreSale
		let weiPrice = contract.freeMoney().divToInt(CONSTANTS.RATE_PRESALE);

		let resBuyAll = await execInEth(() => contract.buyTokens(user, txParams(user, weiPrice)));
		assert.ok(resBuyAll);

		// Проверяем, что юзер выкупил все с PreSale
		assertEq(CONSTANTS.EMISSION_FOR_PRESALE, bnWr(contract.balanceOf(user)));

		checkContract({
			currentState: IcoStates.PreSale,
			freeMoney: bnWr(new BigNumber(0)),
			totalBought: CONSTANTS.EMISSION_FOR_PRESALE
		});

	});

	/**
	 * Тест выкупа всех эмитированных токенов
	 */
	it('test-buy-all-emissioned-tokens', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		let currStage = contract.currentState();
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Будем покупать все токены со Stage1 по StageLast

		// Необходимо все выкупить
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		let freeMoney = bnWr(contract.freeMoney());
		let goingToBuyTokenCount = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE1
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE3)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE4)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE5)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE6)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE7)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGELAST));

		//Считаем сколько надо eth на покупку (emission1 / rate1) + (emission2 / rate2) + ... + (emission7 / rate7)
		let ethCountWei = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE1.divToInt(CONSTANTS.RATE_SALESTAGE1));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2.divToInt(CONSTANTS.RATE_SALESTAGE2)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE3.divToInt(CONSTANTS.RATE_SALESTAGE3)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE4.divToInt(CONSTANTS.RATE_SALESTAGE4)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE5.divToInt(CONSTANTS.RATE_SALESTAGE5)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE6.divToInt(CONSTANTS.RATE_SALESTAGE6)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE7.divToInt(CONSTANTS.RATE_SALESTAGE7)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGELAST.divToInt(CONSTANTS.RATE_SALESTAGELAST)));

		// Проверяем, что у юзера достаточно монет на покупку
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(buyRes);

		// Проверяем, что юзер получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(goingToBuyTokenCount, userTokenBalanceAfterBuy);

		// Проверяем, что перешли на SaleStageLast и там же остались
		checkContract({
			currentState: IcoStates.SaleStageLast,
			freeMoney: bnWr(new BigNumber(0))
		});

		// Проверяем, что больше купить не удасться
		let buyResErr = await execInEth(() => contract.buyTokens(addr, txParams(addr, new BigNumber(1))));
		assert.ok(!buyResErr);

	});

	/**
	 * Тест покупки большего кол-ва токенов, чем было эмитировано
	 */
	it('test-buy-all-emissioned-tokens-overflow', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		let currStage = contract.currentState();
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Будем покупать все токены со Stage1 по StageLast + 1

		// Считаем сколько надо eth на покупку (emission1 / rate1) + (emission2 / rate2) + ... + (emission7 / rate7) + 1
		let ethCountWei = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGE1.divToInt(CONSTANTS.RATE_SALESTAGE1));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2.divToInt(CONSTANTS.RATE_SALESTAGE2)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE3.divToInt(CONSTANTS.RATE_SALESTAGE3)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE4.divToInt(CONSTANTS.RATE_SALESTAGE4)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE5.divToInt(CONSTANTS.RATE_SALESTAGE5)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE6.divToInt(CONSTANTS.RATE_SALESTAGE6)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE7.divToInt(CONSTANTS.RATE_SALESTAGE7)));
		ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGELAST.divToInt(CONSTANTS.RATE_SALESTAGELAST)));
		ethCountWei = bnWr(ethCountWei.plus(1));

		// Проверяем, что у юзера достаточно монет на покупку
		let userWeiBalance = bnWr(web3.eth.getBalance(addr));
		assert.ok(ethCountWei.lessThanOrEqualTo(userWeiBalance));

		// Выполняем покупку
		let buyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, ethCountWei)));
		assert.ok(!buyRes);

		// Проверяем, что юзер не получил токены
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(bnWr(new BigNumber(0)), userTokenBalanceAfterBuy);

		// Проверяем, что не был выполнен переход
		checkContract({
			currentState: IcoStates.SaleStage1,
			freeMoney: CONSTANTS.EMISSION_FOR_SALESTAGE1
		});

	});

	/**
	 * Тест переноса невыкупленных токенов со Stage1 - Stage7 на StageLast
	 */
	it('test-transfer-residues-from-stages-to-stageLast', async () => {

		let addr = accs.user1;
		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);

		// Проверяем, что мы на стадии SaleStage1
		assert.ok(contract.currentState().equals(IcoStates.SaleStage1));

		// Ждем пока не наступит время перехода на StageLast
		while (!contract.canGotoState(IcoStates.SaleStageLast)) {
			await U.delay(1000);
		}

		// Покупаем токенов на 1 wei
		let goingToBuyTokenCount = CONSTANTS.RATE_SALESTAGE1;
		let buyRes = await execInEth(() => contract.buyTokens(addr, txParams(addr, new BigNumber(1))));
		assert.ok(buyRes);

		// Проверяем, что купили токенов по курсу Stage1,
		let userTokenBalanceAfterBuy = bnWr(contract.balanceOf(addr));
		assertEq(goingToBuyTokenCount, userTokenBalanceAfterBuy);

		// freeBalance равен эмиссии для StageLast + сумме всего, что не выкупили на Stage1 - Stage7
		let expectedFreeMoney = bnWr(CONSTANTS.EMISSION_FOR_SALESTAGELAST
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE1)
			.minus(userTokenBalanceAfterBuy)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE3)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE4)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE5)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE6)
			.plus(CONSTANTS.EMISSION_FOR_SALESTAGE7));

		// Проверяем, что произошел переход на SaleStageLast и freebalance
		checkContract({
			currentState: IcoStates.SaleStageLast,
			freeMoney: expectedFreeMoney
		});

	});

	/**
	 * Тест распределение баунти возможно только в количестве не превышающим фиксированное значение EMISSION_FOR_BOUNTY
	 */
	it('test-bounty-emissioned', async () => {

		// Передаем половину bounty user1
		let count = bnWr(CONSTANTS.EMISSION_FOR_BOUNTY.divToInt(2));
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));
		let res1 = await execInEth(() => contract.transferBounty(accs.user1, count, txParams(accs.owner)));
		assert.ok(res1);
		assertEq(count, bnWr(contract.balanceOf(accs.user1)));

		// Пытаемся передать остаток + 1
		let overflowCount = bnWr(CONSTANTS.EMISSION_FOR_BOUNTY.minus(count).plus(1));
		let res2 = await execInEth(() => contract.transferBounty(accs.user1, overflowCount, txParams(accs.owner)));
		assert.ok(!res2);
		assertEq(count, bnWr(contract.balanceOf(accs.user1)));

		// Передаем остаток
		let res3 = await execInEth(() => contract.transferBounty(accs.user1, CONSTANTS.EMISSION_FOR_BOUNTY.minus(count), txParams(accs.owner)));
		assert.ok(res3);
		assertEq(CONSTANTS.EMISSION_FOR_BOUNTY, bnWr(contract.balanceOf(accs.user1)));

		// Пытаемя передать после того как все распределили
		let res4 = await execInEth(() => contract.transferBounty(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(!res4);
		assertEq(CONSTANTS.EMISSION_FOR_BOUNTY, bnWr(contract.balanceOf(accs.user1)));
	});

	/**
	 * Тест распределение team возможно только в количестве не превышающим фиксированное значение EMISSION_FOR_TEAM
	 */
	it('test-team-emissioned', async () => {

		// Передаем половину bounty user1
		let count = bnWr(CONSTANTS.EMISSION_FOR_TEAM.divToInt(2));
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));
		let res1 = await execInEth(() => contract.transferTeam(accs.user1, count, txParams(accs.owner)));
		assert.ok(res1);
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));

		// Пытаемся передать остаток + 1
		let overflowCount = bnWr(CONSTANTS.EMISSION_FOR_TEAM.minus(count).plus(1));
		let res2 = await execInEth(() => contract.transferTeam(accs.user1, overflowCount, txParams(accs.owner)));
		assert.ok(!res2);
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));

		// Передаем остаток
		let res3 = await execInEth(() => contract.transferTeam(accs.user1, CONSTANTS.EMISSION_FOR_TEAM.minus(count), txParams(accs.owner)));
		assert.ok(res3);
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));

		// Пытаемя передать после того как все распределили
		let res4 = await execInEth(() => contract.transferTeam(accs.user1, new BigNumber(1), txParams(accs.owner)));
		assert.ok(!res4);
		assertEq(new BigNumber(0), contract.balanceOf(accs.user1));
	});


	/**
	 * Тест снятия эфира на кошелек владельца
	 */
	it('test-withdrawal', async () => {

		await goToState(IcoStates.PreSale);
		await goToState(IcoStates.SaleStage1);
		//...
		await goToState(IcoStates.SaleStageLast);

		// нельзя снимать до PostIco
		let resErr = await execInEth(() => contract.initWithdrawal(web3.eth.getBalance((<any>contract).address), new BigNumber(1), txParams(accs.owner)));
		assert.ok(!resErr);

		await goToState(IcoStates.PostIco);
		// Снимать можно только на PostIco

		// Не owner не может инициировать снятие
		let resUserErr = await execInEth(() => contract.initWithdrawal(web3.eth.getBalance((<any>contract).address), new BigNumber(1), txParams(accs.user1)));
		assert.ok(!resUserErr);
		let resCoOwnerErr = await execInEth(() => contract.initWithdrawal(web3.eth.getBalance((<any>contract).address), new BigNumber(1), txParams(accs.coOwner)));
		assert.ok(!resCoOwnerErr);


		//-----------------------------------------------
		// владелец может сбросить (по факту) инициацию вывода - выставив нулевые значения в адрес и количество для вывода

		let beforeReset1 = {
			withdrawalTo: contract.withdrawalTo(),
			withdrawalValue: bnWr(contract.withdrawalValue()),
			contractEth: bnWr(web3.eth.getBalance((<any>contract).address)),
		};
		let resReset1 = await execInEth(() => contract.initWithdrawal(accs.user1, beforeReset1.contractEth, txParams(accs.owner)));
		let afterReset1 = {
			withdrawalTo: contract.withdrawalTo(),
			withdrawalValue: bnWr(contract.withdrawalValue()),
		};
		let resReset2 = await execInEth(() => contract.initWithdrawal('', new BigNumber(0), txParams(accs.owner)));
		let afterReset2 = {
			withdrawalTo: contract.withdrawalTo(),
			withdrawalValue: bnWr(contract.withdrawalValue()),
		};

		assert.ok(resReset1);
		assert.ok(afterReset1.withdrawalTo == accs.user1);
		assert.ok(afterReset1.withdrawalValue.equals(beforeReset1.contractEth));
		assert.ok(resReset2);
		assert.ok(afterReset2.withdrawalTo == emptyAddress);
		assert.ok(afterReset2.withdrawalValue.equals(new BigNumber(0)));

		//-----------------------------------------------
		// Снимать могут только владелец совместно с совладельцем
		let before = {
			contractEth: bnWr(web3.eth.getBalance((<any>contract).address)),
			ownerEth: bnWr(web3.eth.getBalance(accs.owner)),
			user1Eth: bnWr(web3.eth.getBalance(accs.user1)),
		};
		let resInit = await execInEth(() => contract.initWithdrawal(accs.user1, before.contractEth, txParams(accs.owner)));

		let wt = contract.withdrawalTo();
		let wv = bnWr(contract.withdrawalValue());
		assert.ok(wt == accs.user1);
		assert.ok(wv.equals(before.contractEth));

		let resApproveErr = await execInEth(() => contract.approveWithdrawal(accs.user1, before.contractEth, txParams(accs.owner)));
		assert.ok(!resApproveErr);
		let resApprove = await execInEth(() => contract.approveWithdrawal(accs.user1, before.contractEth, txParams(accs.coOwner)));

		let after = {
			contractEth: bnWr(web3.eth.getBalance((<any>contract).address)),
			ownerEth: bnWr(web3.eth.getBalance(accs.owner)),
			user1Eth: bnWr(web3.eth.getBalance(accs.user1)),
			withdrawalTo: contract.withdrawalTo(),
			withdrawalValue: bnWr(contract.withdrawalValue()),
		};

		assert.ok(resInit);
		assert.ok(resApprove);
		assertEq(bnWr(new BigNumber(0)), after.contractEth);
		assertEq(bnWr(before.user1Eth.plus(before.contractEth)), after.user1Eth);
		assert.ok(after.withdrawalTo == emptyAddress);
		assertEq(bnWr(new BigNumber(0)), after.withdrawalValue);

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
	async function execInEth(act: () => any): Promise<boolean> {
		unlockAll();
		let txHash = null;
		try {
			txHash = act();
		} catch (err) {
			console.log(err);
			return false;
		}
		while (web3.eth.getTransactionReceipt(txHash) == null) {
			await U.delay(1000);
		}

		let txRec = web3.eth.getTransactionReceipt(txHash);
		let tx = web3.eth.getTransaction(txHash);
		if (txRec.blockNumber == null || tx.blockNumber == null) {
			throw `${txRec.blockNumber} - ${tx.blockNumber}`;
		}

		if (tx.gas > txRec.gasUsed) {
			console.log("tx.gas: " + tx.gas + " > txRec.gasUsed: " + txRec.gasUsed);
		} else {
			console.log("tx.gas: " + tx.gas + " == txRec.gasUsed: " + txRec.gasUsed);
		}

		return tx.gas > txRec.gasUsed;
	}

	//<editor-fold desc="goToStage">

	/**
	 * Вспомагательный метод для перехода на стадию
	 * @param {BigNumber} toStage Стадия для перехода
	 * @param isAllowGreater Признак, что можно перейти более чем на указанную стадию
	 * @returns {Promise<void>}
	 */
	async function goToState(toStage: BigNumber, isAllowGreater: boolean = true): Promise<void> {

		//Если текущая или уже была, выходим
		let fromStage = bnWr(contract.currentState());
		if (toStage.lessThanOrEqualTo(fromStage)) return;

		console.log("goToState: " + toStage);

		// PreSale и SaleStage1
		if (toStage.equals(IcoStates.PreSale) || toStage.equals(IcoStates.SaleStage1) || toStage.equals(IcoStates.PostIco)) {

			// Достаточно дождаться и дернуть ручку
			while (!contract.canGotoState(toStage)) {
				await U.delay(1000);
			}

			let res = await execInEth(() => contract.gotoNextState(txParams(accs.owner)));
			assert.ok(res);
		}

		// SaleStage2 - SaleStage7
		else if (toStage.equals(IcoStates.SaleStage2) ||
			toStage.equals(IcoStates.SaleStage3) ||
			toStage.equals(IcoStates.SaleStage4) ||
			toStage.equals(IcoStates.SaleStage5) ||
			toStage.equals(IcoStates.SaleStage6) ||
			toStage.equals(IcoStates.SaleStage7)) {

			let freeMoney0 = bnWr(contract.freeMoney());
			let currentState0 = bnWr(contract.currentState());

			// Необходимо выкупить freemoney
			//Считаем сколько надо eth на выкуп всего
			let ethCountWei = bnWr(new BigNumber(0));
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage1) && IcoStates.SaleStage2.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE1.divToInt(CONSTANTS.RATE_SALESTAGE1)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage2) && IcoStates.SaleStage3.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE2.divToInt(CONSTANTS.RATE_SALESTAGE2)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage3) && IcoStates.SaleStage4.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE3.divToInt(CONSTANTS.RATE_SALESTAGE3)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage4) && IcoStates.SaleStage5.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE4.divToInt(CONSTANTS.RATE_SALESTAGE4)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage5) && IcoStates.SaleStage6.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE5.divToInt(CONSTANTS.RATE_SALESTAGE5)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage6) && IcoStates.SaleStage7.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE6.divToInt(CONSTANTS.RATE_SALESTAGE6)));
			}
			if (fromStage.lessThanOrEqualTo(IcoStates.SaleStage7) && IcoStates.SaleStageLast.lessThanOrEqualTo(toStage)) {
				ethCountWei = bnWr(ethCountWei.plus(CONSTANTS.EMISSION_FOR_SALESTAGE7.divToInt(CONSTANTS.RATE_SALESTAGE7)));
			}

			// Выполняем покупку
			let res = await execInEth(() => contract.buyTokens(accs.lucky, txParams(accs.lucky, ethCountWei)));
			assert.ok(res);

			let freeMoney = bnWr(contract.freeMoney());
			let currentState = bnWr(contract.currentState());
		}
		else if (toStage.equals(IcoStates.SaleStageLast)) {
			//Чтобы попасть на SaleStageLast дожидаемся наступления SaleStageLast после выполняем покупку
			//Именно дожидаемся, т.к. по умолчанию нужен случай, что остались нерапроданные токены
			while (!contract.canGotoState(IcoStates.SaleStageLast)) {
				await U.delay(1000);
			}
			// Выполняем покупку
			let res = await execInEth(() => contract.buyTokens(accs.lucky, txParams(accs.lucky, contract.rate())));
			assert.ok(res);
		}


		//Проверяем, что переход был выполнен
		//ToDo Проверять состояние контракта при переходе на новую стадию с помощью checkContract
		if (isAllowGreater) {
			assert.ok(contract.currentState().greaterThanOrEqualTo(toStage));
		} else {
			assert.ok(contract.currentState().equals(toStage));
		}
	}

	//</editor-fold>

	/**
	 * Вспомагательный метод для проверки равенства значений BigNumber
	 * @param {BigNumber} expected Ожидаемое значение
	 * @param {BigNumber} value Текущее значение
	 */
	function assertEq(expected: BigNumber, value: BigNumber, message?: string): void {
		assert.ok(expected.equals(value), (message + " expected: " + expected + " value: " + value).trim());
	}

	/**
	 * Вспомагательный метод переводит время контракта в Date
	 * @param {BigNumber} sec Время контракта
	 * @returns {Date} Время в js
	 */
	function toDateTimeUtc(sec: BigNumber): Date {
		let dt = new Date(1970, 0, 1);
		dt.setSeconds(sec.toNumber());
		return dt;
	}

	/**
	 * Вспомагательный метод для разлочки тестовых счетов
	 */
	function unlockAll() {
		// Разлочиваем все счета
		Object.keys(accs).map(acc => {
			web3.personal.unlockAccount((<any>accs)[acc], config.accountPass)
		});
	}

	async function getContractReceiver(): Promise<{ address: string }> {
		let c = await deployTest("ContractReceiver", config.rpcAddress, accs.deployer, config.accountPass);
		let contractReceiver = web3.eth.contract(c.abi).at(c.address);
		return contractReceiver;
	}

	function getContractReceiverData(contract: any): { sender: string, value: BnWr, data: string, functionName: string } {
		return {
			sender: (<any>contract).sender(),
			value: bnWr((<any>contract).value()),
			data: (<any>contract).data(),
			functionName: (<any>contract).functionName(),
		}
	}

	async function getContractReceiverWithError(): Promise<{ address: string }> {
		let c = await deployTest("ContractReceiverForTestWithError", config.rpcAddress, accs.deployer, config.accountPass);
		let contractReceiver = web3.eth.contract(c.abi).at(c.address);
		return contractReceiver;
	}


	async function getContractReceiverNotForErc223(): Promise<{ address: string }> {
		let c = await deployTest("ContractReceiverNotForErc223", config.rpcAddress, accs.deployer, config.accountPass);
		let contractReceiver = web3.eth.contract(c.abi).at(c.address);
		return contractReceiver;
	}

});