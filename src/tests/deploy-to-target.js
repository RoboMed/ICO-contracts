let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');
let Miner = require('./miner');

/**
 * Функция для компилирования sol файлов
 * @returns {Promise.<void>}
 */
function compileSol() {
    console.log("compileSol started...");
    u.execProcessSync("build.bat");
    console.log("compileSol finished");
}

/**
 * Функция для загрузки контракта в сеть
 * @param config Конфиг
 * @param from The address transactions should be made from
 * @returns Contract object
 */
function loadContract(config, from) {

    let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

    console.log("loadContract started...");

    let abi = fs.readFileSync('out/RobomedIco.abi');
    let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

    let gasEstimate = web3.eth.estimateGas({data: compiled}) + 1000000;
    console.log("gasEstimate: " + gasEstimate);

    web3.eth.defaultAccount = from;
    web3.personal.unlockAccount(web3.eth.defaultAccount, config.accountPass);
    console.log("unlockAccount: " + web3.eth.defaultAccount);

    let miner = new Miner();
    miner.start();

    return new Promise((resolve, reject) => {

        web3.eth.contract(abi).new({
            data: compiled,
            from: from,
            gas: gasEstimate
        }, function (err, contract) {
            if (err) {
                miner.stop();
                reject(err);
                // callback fires twice, we only want the second call when the contract is deployed
            }
            else if (contract.address) {
                miner.stop();
                resolve(contract);
            }
        });
    });
}

/**
 * Функция компилирует и деплоит контракт
 * @returns {Contract} Promise<Contract>
 */
function init() {

    let config = u.getConfigFromArgv(process.argv);

    // тестовые данные
    let data = u.readPreparedTestData(config.preparedDataPath);

    // компилируем
    compileSol();

    // загружаем в сеть
    let contract = loadContract(config, data.owner.addr); //Promise;

    contract.then(c => {
        console.log("contract address: " + c.address);
        console.log("contract abi: " + c.abi.toString())
    });

    return contract;
}

module.exports = {
    init: init
};


