let assert = require("assert");
let prepare_test_data = require("./prepare-test-data");
let deploy_to_target = require("./deploy-to-target");
let ContractConstants = require("./contract-constants");
let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');
let BigNumber = require('bignumber.js');
let IcoStates = require("./ico-states");
let bnWr = require("./bn-wr");

const timeout = 100000;

let web3 = null;
let contract = null;
let config = null;
let preparedData = null;
let CONSTANTS = null;

describe('TestInit', () => {


    before(function () {
        // runs before all tests in this block
        console.log("Test before");
        BigNumber.config({EXPONENTIAL_AT: 1e+9});

        config = u.getConfigFromEnv(process.env);
        web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

        assert.ok(config != undefined);
        assert.ok(web3 != undefined);
    });

    beforeEach(function (done) {
        console.log("beforeEach");

        this.timeout(timeout);

        prepare_test_data.initAndWrite(config);
        deploy_to_target.init(config).then(c => {

            contract = web3.eth.contract(c.abi).at(c.address);
            assert.ok(contract.address);

            CONSTANTS = new ContractConstants(contract);

            done();
        });

        //abi = JSON.parse(fs.readFileSync('out/RobomedIco.abi'));
        //contractAddress = "0xaebb4bfe88cfac310c8671027c35e0131376bbcb";
        //contract = web3.eth.contract(abi).at(contractAddress);

        preparedData = u.readDataFromFileSync(config.preparedDataPath);

        [preparedData.owner.addr,
            preparedData.user1.addr,
            preparedData.user2.addr
        ].map(addr => {
            web3.personal.unlockAccount(addr, config.accountPass)
        });

    });

    afterEach(() => {
        console.log("afterEach");
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
        let balance = bnWr(contract.balanceOf(preparedData.owner.addr));
        assert.equal(balance.strVal, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.strVal)
    });

    it('test-transfer-all', () => {
        // Тест на передачу VIP токенов одному юзеру

        let txHash = contract.transfer(preparedData.user1.addr, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT);
        u.waitForTransactions(web3, txHash);

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);

        assert.ok(contractRmTokens.equals(0));
        assert.ok(user1RmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT));
    });

    /**
     * Тест, что нельзя передавать VIP токенов больше чем есть
     */
    it('test-transfer-vipTokens-overflow', () => {

        // Кол-во оставшихся VIP токенов + 1
        let count = bmWr(contract.vipPlacementNotDistributed().add(1));

        // Пытаемся передать VIP токенов больше чем осталось
        let res = execInEth(() => contract.transfer(preparedData.user1.addr, count, txParams(preparedData.owner.addr)));
        assert.ok(!res);

        let contractRmTokens = bmWr(contract.balanceOf(preparedData.owner.addr));
        let user1RmTokens = bmWr(contract.balanceOf(preparedData.user1.addr));

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
        let txHash1 = contract.transfer(preparedData.user1.addr, new BigNumber(100));
        let txHash2 = contract.transfer(preparedData.user2.addr, new BigNumber(200));
        u.waitForTransactions(web3, [txHash1, txHash2]);

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);
        let user2RmTokens = contract.balanceOf(preparedData.user2.addr);

        assert.ok(contractRmTokens.equals(CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
        assert.ok(user1RmTokens.equals(100));
        assert.ok(user2RmTokens.equals(200));

        // пытаемся перечислить user1 max - 100 - 200 + 1
        let txHashErr = contract.transfer(preparedData.user1.addr, CONSTANTS.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200).add(1));
        //ToDo не понятно где указывать gas и надо ли
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

        let addr = preparedData.user1.addr;

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
     * Тест, что юзеры не могут передать vipTokens до PostIco
     */
    it('test-cannot-transfer-vipTokens-before-postIco', () => {

        // Сумма, которую будем покупать, передавать
        let sum = bnWr(new BigNumber(1));
        let bUser1, bUser2;

        // Передаем vipTokens юзеру 1
        let res1 = execInEth(() => contract.transfer(preparedData.user1.addr, sum, txParams(preparedData.owner.addr)));
        assert.ok(res1);

        // Проверяем баланс
        bUser1 = bnWr(contract.balanceOf(preparedData.user1.addr));
        assert.ok(bUser1.equals(sum));

        // Юзер 1 пытается передать их юзеру 2
        let res2 = execInEth(() => contract.transfer(preparedData.user2.addr, sum, txParams(preparedData.user1.addr)));
        assert.ok(!res2);

        // Проверяем балансы
        bUser1 = bnWr(contract.balanceOf(preparedData.user1.addr));
        bUser2 = bnWr(contract.balanceOf(preparedData.user2.addr));

        assert.ok(bUser1.equals(sum));
        assert.ok(bUser2.equals(new BigNumber(0)));
    });


    /**
     * Тест покупки на preSale
     */
    it('test-buy-on-preSale', () => {

        let user = preparedData.user1;
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
        let res = execInEth(() => contract.buyTokens(user.addr, txParams(user.addr, web3.toWei(etherCount))));
        assert.ok(res);

        // Проверяем что купили
        let userRmTokens = bnWr(contract.balanceOf(user.addr));

        assert.ok(userRmTokens.equals(count));
        checkContract({
            freeMoney: CONSTANTS.EMISSION_FOR_PRESALE.minus(count),
            totalBought: count
        });
    });

    function bnWr(bn) {
        bn.strVal = bn.toNumber();
        return bn;
    }

    /**
     * Вспомагательная функция проверяет значения полей контракта
     * @param params
     */
    function checkContract(params) {

        if (params.hasOwnProperty('currentState')) {
            let value = contract.currentState();
            let expected = params.currentState;
            assert.equal(value.strVal, expected.strVal, "currentState");
        }

        if (params.hasOwnProperty('totalBalance')) {
            let value = contract.totalBalance();
            let expected = params.totalBalance;
            assert.equal(value.strVal, expected.strVal, "totalBalance");
        }

        if (params.hasOwnProperty('freeMoney')) {
            let value = contract.freeMoney();
            let expected = params.freeMoney;
            assert.equal(value.strVal, expected.strVal, "freeMoney");
        }

        if (params.hasOwnProperty('totalSupply')) {
            let value = contract.totalSupply();
            let expected = params.totalSupply;
            assert.equal(value.strVal, expected.strVal, "totalSupply");
        }

        if (params.hasOwnProperty('totalBought')) {
            let value = contract.totalBought();
            let expected = params.totalBought;
            assert.equal(value.strVal, expected.strVal, "totalBought");
        }

        if (params.hasOwnProperty('vipPlacementNotDistributed')) {
            let value = contract.vipPlacementNotDistributed();
            let expected = params.vipPlacementNotDistributed;
            assert.equal(value.strVal, expectedstrVal, "vipPlacementNotDistributed");
        }

        if (params.hasOwnProperty('remForPreSale')) {
            let value = contract.remForPreSale();
            let expected = params.remForPreSale;
            assert.equal(value.strVal, expected.strVal, "remForPreSale");
        }

        if (params.hasOwnProperty('rate')) {
            let value = contract.rate();
            let expected = params.rate;
            assert.equal(value.strVal, expected.strVal, "rate");
        }
    }

    function txParams(addr, value = null) {
        let res = {from: addr, gas: 200000};
        if (value !== null) {
            res.value = value;
        }
        return res;
    }

    function execInEth(act) {
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

        let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(preparedData.owner.lucky)));

        assert.ok(res);
    }
});