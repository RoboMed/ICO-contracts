let u = require('./u');
let Web3 = require('web3');

////////////////////////////////////////////////////
//
// Скрипт для подготовки сети перед тестированием
// Во время работы скрипта:
//  -должен быть запущен geth
//  -не должно выполняться майнинга
//
////////////////////////////////////////////////////

/**
 * Функция для майнинга монет на указанный счет
 * @param etherbase Счет для майнинга
 * @param coinCount Кол-во монет
 */
function mineSomeCoins(etherbase, coinCount) {

    let exec = "\"var prevCoinbase = eth.coinbase; " +
        "miner.setEtherbase('" + etherbase + "');" +
        "miner.start(1);" +
        "while(eth.getBalance('" + etherbase + "') < " + coinCount + "){ admin.sleepBlocks(1); };" +
        "miner.stop();" +
        "miner.setEtherbase(prevCoinbase);\"";

    let cmd = "geth attach --exec " + exec;

    console.log(cmd);

    u.execProcessSync(cmd);
}

/**
 * Функция для завершения ожидающих транзакций
 * @param etherbase Счет для майнинга
 */
function commitPendingTransactions(etherbase) {

    let exec = "\"var prevCoinbase = eth.coinbase; " +
        "miner.setEtherbase('" + etherbase + "');" +
        "miner.start(1);" +
        "admin.sleepBlocks(1);" +
        "miner.stop();" +
        "miner.setEtherbase(prevCoinbase);\"";


    let cmd = "geth attach --exec " + exec;

    console.log(cmd);

    u.execProcessSync(cmd);
}

/**
 * Функция для подготовки сети перед тестированием
 * @returns {{owner: {addr: *}, user1: {addr: *}, user2: {addr: *}}}
 */
function init() {

    let config = u.getConfigFromArgv(process.argv);
    let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

    // Создаем несколько новых аккаунтов
    let owner = web3.personal.newAccount(config.accountPass);
    console.log("Created owner account: " + owner);
    let user1 = web3.personal.newAccount(config.accountPass);
    console.log("Created user1 account: " + user1);
    let user2 = web3.personal.newAccount(config.accountPass);
    console.log("Created user2 account: " + user2);

    // Майним монетки для теста на отдельный счет
    let coinSourceAccount = web3.personal.newAccount(config.accountPass);
    web3.personal.unlockAccount(coinSourceAccount, config.accountPass);
    mineSomeCoins(coinSourceAccount, web3.toWei(5));

    console.log("balance coinSourceAccount: " + web3.fromWei(web3.eth.getBalance(coinSourceAccount)));

    // Распределяем намайненное
    let tx1 = web3.eth.sendTransaction({from: coinSourceAccount, to: owner, value: web3.toWei(1, "ether")});
    let tx2 = web3.eth.sendTransaction({from: coinSourceAccount, to: user1, value: web3.toWei(1, "ether")});
    let tx3 = web3.eth.sendTransaction({from: coinSourceAccount, to: user2, value: web3.toWei(1, "ether")});

    //ждем, пока все монеты дойдут
    commitPendingTransactions(coinSourceAccount);

    console.log("balance owner: " + web3.fromWei(web3.eth.getBalance(owner)));
    console.log("balance user1: " + web3.fromWei(web3.eth.getBalance(user1)));
    console.log("balance user2: " + web3.fromWei(web3.eth.getBalance(user2)));

    //Возвращаем готовые тестовые данные
    let preparedData = {
        owner: {addr: owner},
        user1: {addr: user1},
        user2: {addr: user2},
    };
    u.writePreparedTestData(config.preparedDataPath, preparedData);
    return preparedData;
}

module.exports = {
    init: init
};




