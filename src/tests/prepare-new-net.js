let u = require('./u');
let Web3 = require('web3');

////////////////////////////////////////////////////
//
// Скрипт для подготовки новой сети перед тестированием
// Создает новый аккаунт для майнинга и выставляет его в coinbase
//
// Во время работы скрипта:
//  -должен быть запущен geth
//
////////////////////////////////////////////////////

/**
 * Функция для подготовки новой сети перед тестированием
 * @param config Конфиг
 * @returns coinbase
 */
function init(config = null) {

    config = config != null ? config : u.getConfigFromArgv();

    let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

    let coinbase = web3.personal.newAccount(config.accountPass);

    let exec = " \"miner.setEtherbase('" + coinbase + "');\" ";
    let cmd = "geth attach --exec " + exec;

    u.execProcessSync(cmd);

    return coinbase;
}

/**
 * Функция для подготовки новой сети перед тестированием
 * Сохраняет результат в файл
 * @param config Конфиг
 * @returns coinbase
 */
function initAndWrite(config = null) {

    config = config != null ? config : u.getConfigFromArgv(process.argv);

    let coinbase = init(config);
    u.writeDataToFileSync(config.preparedNewNetPath, coinbase);

    console.log(coinbase);

    return coinbase;
}

module.exports = {
    init: init,
    initAndWrite: initAndWrite
};




