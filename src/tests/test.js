let assert = require("assert");
let prepare_test_data = require("./prepare-test-data");
let deploy_to_target = require("./deploy-to-target");
let ContractConstants = require("./contract-constants");
let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');
let BigNumber = require('bignumber.js');
let IcoStates = require("./ico-states");

const timeout = 100000;

let web3 = null;
let contract = null;
let config = null;
let preparedData = null;
let contractConstants = null;

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

            contractConstants = new ContractConstants(contract);

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

    it('test1', (done) => {

        // Тест для проверки начального состояния контракта

        // Проверяем, что контракт на 0 стадии (VipReplacement)
        let currentState = contract.currentState();
        assert.ok(currentState.equals(IcoStates.VipPlacement));

        let canGotoState1 = contract.canGotoState(IcoStates.PreSale);
        let canGotoState2 = contract.canGotoState(IcoStates.SaleStage1);
        let canGotoState3 = contract.canGotoState(IcoStates.SaleStage2);
        let canGotoState4 = contract.canGotoState(IcoStates.SaleStage3);
        let canGotoState5 = contract.canGotoState(IcoStates.SaleStage4);

        //assert.ok(canGotoState1 == false);// ToDo: Уточнить
        assert.ok(canGotoState2 == false);
        assert.ok(canGotoState3 == false);
        assert.ok(canGotoState4 == false);
        assert.ok(canGotoState5 == false);

        // Проверяем кол-во RobomedTokens:
        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);
        let user2RmTokens = contract.balanceOf(preparedData.user2.addr);

        assert.ok(contractRmTokens.equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(user1RmTokens.equals(0));
        assert.ok(user2RmTokens.equals(0));

        // Пытаемся купить что-нибудь на 0 стадии
        let res = contract.buyTokens.call(preparedData.user2.addr, {value: 1, gas: 200000});
        //Возвращается []
        //ToDO: заранее считать кол-во газа
        //ToDo: убедиться по res, что операция не выполнилась

        // Баланс rmTokens не должен измениться
        assert.ok(contract.balanceOf(preparedData.owner.addr).equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(contract.balanceOf(preparedData.user1.addr).equals(0));
        assert.ok(contract.balanceOf(preparedData.user2.addr).equals(0));
    });

    it('test-transfer-1-all', () => {
        // Тест на передачу VIP токенов одному юзеру

        let txHash = contract.transfer(preparedData.user1.addr, contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT);
        u.waitForTransactions(web3, txHash);

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);

        assert.ok(contractRmTokens.equals(0));
        assert.ok(user1RmTokens.equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT));
    });

    it('test-transfer-2-overflow', () => {
        // Тест на передачу VIP токенов больше чем есть

        let txHash = contract.transfer(preparedData.user1.addr, contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT.add(1));
        u.waitForTransactions(web3, txHash);

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);

        // Ничего не должно измениться
        assert.ok(contractRmTokens.equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(user1RmTokens.equals(0));
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

        assert.ok(contractRmTokens.equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
        assert.ok(user1RmTokens.equals(100));
        assert.ok(user2RmTokens.equals(200));

        // пытаемся перечислить user1 max - 100 - 200 + 1
        let txHashErr = contract.transfer(preparedData.user1.addr, contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200).add(1));
        //ToDo не понятно где указывать gas и надо ли
        //u.delaySync(4000);
        //let res = web3.eth.getTransactionReceipt(txHashErr);

        // Ничего не должно измениться
        assert.ok(contractRmTokens.equals(contractConstants.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
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
        assert.ok(priceRes.equals(contractConstants.PRIZE_SIZE_FORGOTO));
    });


    /**
     * Тест проверяет, что нельзя передать vipTokens до завершения ICO
     */
    it('test-cannot-transfer-vipTokens', () => {

        // Передаем vipTokens юзеру 1
        let txHash1 = contract.transfer(preparedData.user1.addr, new BigNumber(10));
        u.waitForTransactions(web3, txHash1);

        // Юзер 1 пытается передать их юзеру 2
        let txHash2 = contract.transfer(preparedData.user2.addr, new BigNumber(10));
        u.waitForTransactions(web3, txHash);
    });


    /**
     * Тест покупки на preSale
     */
    it('test-buy-on-preSale', () => {

        goToPreSale();

        //свободные токены должны быть в ко-ве эмиссии
        let fm = bnWr(contract.freeMoney());
        assert.ok(contractConstants.EMISSION_FOR_PRESALE.equals(fm));

        let totalBought = bnWr(contract.totalBought());
        assert.ok(totalBought.equals(new BigNumber(0)));

        let user = preparedData.user1;

        // Пытаемся купить rmToken
        let etherCount = bnWr(new BigNumber(1));

        // Считаем, сколько rmToken должны купить на 1 ether
        let count = bnWr(web3.toWei(etherCount).mul(contractConstants.RATE_PRESALE));

        let res = execInEth(() => contract.buyTokens(user.addr, txParams(user.addr, web3.toWei(etherCount))));
        assert.ok(res);

        // Проверяем что купили
        let userRmTokens = bnWr(contract.balanceOf(user.addr));
        let fm2 = bnWr(contract.freeMoney());
        let totalBought2 = bnWr(contract.totalBought());

        assert.ok(userRmTokens.equals(count));
        assert.ok(fm2.equals(contractConstants.EMISSION_FOR_PRESALE.minus(count)));
        assert.ok(totalBought2.equals(count));
    });

    function bnWr(bn) {
        bn.strVal = bn.toNumber();
        return bn;
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

        let res = execInEth(() => contract.gotoNextStateAndPrize(txParams(preparedData.owner.addr)));

        assert.ok(res);
    }
});