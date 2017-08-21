let config = require('./config');
let u = require('./src/u');
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

var child_process = require('child_process');

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

    let exec = "\"miner.setEtherbase('" + etherbase + "');" +
        "miner.start(1);" +
        "while(eth.getBalance('" + etherbase + "') < " + coinCount + "){};" +
        "miner.stop();\"";

    let cmd = "geth attach --exec " + exec;

    console.log(cmd);

    child_process.execSync(cmd, (error, stdout, stderr) => {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
}

/**
 * Функция для завершения ожидающих транзакций
 * @param etherbase Счет для майнинга
 * @param pendingAccounts Счета, по которым ожидается изменение баланса
 */
function commitPendingTransactions(etherbase, pendingAccounts) {

    //будем ждать, пока баланс всех pendingAccounts изменится
    let condition = pendingAccounts.map(acc => {
        let balance = web3.eth.getBalance(acc).toNumber();
        return "eth.getBalance('" + acc + "') == " + balance;
    }).join(" && ");

    let exec = "\"miner.setEtherbase('" + etherbase + "');" +
        "miner.start(1);" +
        "while(" + condition + "){};" +
        "miner.stop();\"";

    let cmd = config.gethExePath + " attach --exec " + exec;

    console.log(cmd);

    child_process.execSync(cmd, (error, stdout, stderr) => {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
}

/**
 * Функция для подготовки сети перед тестированием
 * @param config Конфиг
 * @returns {{owner: {addr: *}, user1: {addr: *}, user2: {addr: *}}}
 */
function run(config) {

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
    mineSomeCoins(coinSourceAccount, 3);

    console.log("balance coinSourceAccount: " + web3.eth.getBalance(coinSourceAccount));

    // Распределяем намайненное
    let tx1 = web3.eth.sendTransaction({from: coinSourceAccount, to: owner, value: web3.toWei(1, "ether")});
    let tx2 = web3.eth.sendTransaction({from: coinSourceAccount, to: user1, value: web3.toWei(1, "ether")});
    let tx3 = web3.eth.sendTransaction({from: coinSourceAccount, to: user2, value: web3.toWei(1, "ether")});

    //ждем, пока все монеты дойдут
    commitPendingTransactions(coinSourceAccount, [owner, user1, user2]);

    console.log("balance owner: " + web3.eth.getBalance(owner));
    console.log("balance user1: " + web3.eth.getBalance(user1));
    console.log("balance user2: " + web3.eth.getBalance(user2));

    //Возвращаем готовые тестовые данные
    return {
        owner: {addr: owner},
        user1: {addr: user1},
        user2: {addr: user2},
    }
}

let res = run(config);
console.log("res: " + res);





