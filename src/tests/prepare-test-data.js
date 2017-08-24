let u = require('./u');
let Web3 = require('web3');

////////////////////////////////////////////////////
//
// Скрипт для подготовки сети перед тестированием
// Во время работы скрипта:
//  -должен быть запущен geth
//  -майнинг должен выполняться
//
////////////////////////////////////////////////////

/**
 * Функция для подготовки сети перед тестированием
 * @returns {{owner: {addr: *}, user1: {addr: *}, user2: {addr: *}}}
 */
function init(config = null) {

    config = config != null ? config : u.getConfigFromArgv(process.argv);
    let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

    // Если майнинг не запущен - ошибка
    let isMining = web3.eth.mining;
    if (!isMining) throw "Должен выполняться майнинг в сети";

    // Создаем несколько новых аккаунтов
    let owner = web3.personal.newAccount(config.accountPass);
    let user1 = web3.personal.newAccount(config.accountPass);
    let user2 = web3.personal.newAccount(config.accountPass);

    // Пополняем кошельки
    let coinSourceAccount = web3.eth.coinbase;
    web3.personal.unlockAccount(coinSourceAccount, config.accountPass);
    let tx1 = web3.eth.sendTransaction({from: coinSourceAccount, to: user1, value: web3.toWei(1, "ether")});
    let tx2 = web3.eth.sendTransaction({from: coinSourceAccount, to: user2, value: web3.toWei(1, "ether")});

    //ждем, пока все монеты дойдут
    u.waitForTransactions(web3, [tx1, tx2]);

    //Возвращаем готовые тестовые данные
    let preparedData = {
        owner: {addr: owner},
        user1: {addr: user1},
        user2: {addr: user2},
    };

    console.log(preparedData);

    return preparedData;
}

/**
 * Функция для подготовки тестовых данных для тестирования
 * Сохраняет результат в файл
 * @param config Конфиг
 * @returns Тестовые данные
 */
function initAndWrite(config = null) {

    config = config != null ? config : u.getConfigFromArgv(process.argv);

    let data = init(config);
    u.writeDataToFileSync(config.preparedDataPath, data);

    return data;
}

module.exports = {
    init: init,
    initAndWrite: initAndWrite
};




