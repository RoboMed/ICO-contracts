let assert = require("assert");
let prepare_net = require("./prepare-net");
let deploy_to_target = require("./deploy-to-target");
let contract_constants = require("./contract-constants");
let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');
let Miner = require('./miner');
let BigNumber = require('bignumber.js');

const timeout = 100000;

let web3 = null;
let contract = null;
let config = null;
let miner = new Miner();
let preparedData = null;

function waitForTransaction(txHash) {
    while (web3.eth.getTransactionReceipt(txHash) == null) {
        u.delaySync(500);
    }
}

describe('TestInit', () => {


    before(function () {
        // runs before all tests in this block
        console.log("Test before");

        config = u.getConfigFromEnv(process.env);
        web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

        assert.ok(config != undefined);
        assert.ok(web3 != undefined);

    });

    beforeEach(function (done) {
        console.log("beforeEach");

        this.timeout(timeout);

        prepare_net.init(config);
        deploy_to_target.init(config).then(c => {

            contract = web3.eth.contract(c.abi).at(c.address);
            assert.ok(contract.address);

            miner.start();
            done()
        });

        //abi = JSON.parse(fs.readFileSync('out/RobomedIco.abi'));
        //contractAddress = "0xaebb4bfe88cfac310c8671027c35e0131376bbcb";
        //contract = web3.eth.contract(abi).at(contractAddress);

        preparedData = u.readPreparedTestData(config.preparedDataPath);

        web3.personal.unlockAccount(preparedData.owner.addr, config.accountPass);
        web3.personal.unlockAccount(preparedData.user1.addr, config.accountPass);
        web3.personal.unlockAccount(preparedData.user2.addr, config.accountPass);

    });

    afterEach(() => {
        console.log("afterEach");
        miner.stop();
    });

    it('test1', (done) => {

        // Тест для проверки начального состояния контракта

        // Проверяем, что контракт на 0 стадии (VipReplacement)
        let currentState = contract.currentState();
        assert.ok(currentState == 0);

        let canGotoState1 = contract.canGotoState(1);
        let canGotoState2 = contract.canGotoState(2);
        let canGotoState3 = contract.canGotoState(3);
        let canGotoState4 = contract.canGotoState(4);
        let canGotoState5 = contract.canGotoState(5);

        //assert.ok(canGotoState1 == false);// ToDo: Уточнить
        assert.ok(canGotoState2 == false);
        assert.ok(canGotoState3 == false);
        assert.ok(canGotoState4 == false);
        assert.ok(canGotoState5 == false);

        // Проверяем кол-во RobomedTokens:
        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);
        let user2RmTokens = contract.balanceOf(preparedData.user2.addr);

        assert.ok(contractRmTokens.equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(user1RmTokens.equals(0));
        assert.ok(user2RmTokens.equals(0));

        // Пытаемся купить что-нибудь на 0 стадии
        let res = contract.buyTokens.call(preparedData.user2.addr);

        //ToDo: убедиться по res, что операция не выполнилась

        // Баланс rmTokens не должен измениться
        assert.ok(contract.balanceOf(preparedData.owner.addr).equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(contract.balanceOf(preparedData.user1.addr).equals(0));
        assert.ok(contract.balanceOf(preparedData.user2.addr).equals(0));
    });

    it('test-transfer-1-all', () => {
        // Тест на передачу VIP токенов одному юзеру

        let txHash = contract.transfer(preparedData.user1.addr, contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT);
        //ToDo надо дожидаться проведения транзакции

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1 = contract.balanceOf(preparedData.user1.addr);

        assert.ok(contractRmTokens.equals(0));
        assert.ok(user1RmTokens.equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT));
    });

    it('test-transfer-2-overflow', () => {
        // Тест на передачу VIP токенов больше чем есть

        let txHash = contract.transfer(preparedData.user1.addr, contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT.add(1));
        //ToDo надо дожидаться проведения транзакции

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);

        // Ничего не должно измениться
        assert.ok(contractRmTokens.equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT));
        assert.ok(user1RmTokens.equals(0));
    });

    it('test-transfer-3-distribution', () => {

        // user1 получает 100
        // user2 получает 200
        let txHash1 = contract.transfer(preparedData.user1.addr, new BigNumber(100));
        let txHash2 = contract.transfer(preparedData.user2.addr, new BigNumber(200));
        //ToDo надо дожидаться проведения транзакции

        let contractRmTokens = contract.balanceOf(preparedData.owner.addr);
        let user1RmTokens = contract.balanceOf(preparedData.user1.addr);
        let user2RmTokens = contract.balanceOf(preparedData.user2.addr);

        assert.ok(contractRmTokens.equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
        assert.ok(user1RmTokens.equals(100));
        assert.ok(user2RmTokens.equals(200));

        // пытаемся перечислить user1 max - 100 - 200 + 1
        let txHashErr = contract.transfer(preparedData.user1.addr, contractRmTokens.add(1));

        // Ничего не должно измениться
        assert.ok(contractRmTokens.equals(contract_constants.INITIAL_COINS_FOR_VIPPLACEMENT.minus(100 + 200)));
        assert.ok(user1RmTokens.equals(100));
        assert.ok(user2RmTokens.equals(200));
    });
});