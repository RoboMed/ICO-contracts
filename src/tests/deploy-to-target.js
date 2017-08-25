let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');

/**
 * Функция для компилирования sol файлов
 */
function compileSol() {

    u.execProcessSync("build.bat");
    console.log("contract compiled");
}

/**
 * Функция для загрузки контракта в сеть
 * @param config Конфиг
 * @param from The address transactions should be made from
 * @returns Promise object
 */
function uploadContract(config, from) {

    let web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

    let abi = JSON.parse(fs.readFileSync('out/RobomedIco.abi'));
    let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

    let gasEstimate = web3.eth.estimateGas({data: compiled}) + 1000000;
    //console.log("gasEstimate: " + gasEstimate);

    web3.personal.unlockAccount(from, config.accountPass);
    //console.log("unlockAccount: " + from);

    return new Promise((resolve, reject) => {

        web3.eth.contract(abi).new({
            data: compiled,
            from: from,
            gas: gasEstimate
        }, (err, contract) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else if (contract.address) {
                resolve(contract);
            }
        });
    });
}

/**
 * Функция компилирует и деплоит контракт
 * @returns {Promise.<TResult>} Promise<Contract>
 */
function init(config = null) {

    config = config != null ? config : u.getConfigFromArgv(process.argv);

    // тестовые данные
    let data = u.readDataFromFileSync(config.preparedDataPath);

    // компилируем
    compileSol();

    // загружаем в сеть
    let contract = uploadContract(config, data.owner.addr); //Promise;

    return contract.then(c => {
        console.log("contract.owner: " + data.owner.addr);
        console.log("contract.address: " + c.address);
        console.log("contract.abi: " + JSON.stringify(c.abi));
        console.log();
        return c;
    });

}

module.exports = {
    init: init
};


