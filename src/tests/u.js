let child_process = require('child_process');
let fs = require('fs');

function delaySync(ms = 0) {
    let dt = new Date();
    while ((new Date()) - dt <= ms) { /* Do nothing */
    }
    //return new Promise(resolve => setTimeout(resolve, ms));
}

function execProcessSync(cmd) {
    child_process.execSync(cmd, function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);

        if (error != null) throw error;
    });
}

function getConfigFromArgv(argv) {

    try {
        let params = argv.find(x => x.includes("configFile"));
        let configFile = params.split("=")[1];
        let data = fs.readFileSync(configFile);
        let config = JSON.parse(data);

        return config;
    }
    catch (e) {
        console.error(e);
        console.log("argv:");
        console.log(argv);

        throw e;
    }
}

function getConfigFromEnv(env) {

    try {
        let configFile = env["configFile"];
        let data = fs.readFileSync(configFile);
        let config = JSON.parse(data);

        return config;
    }
    catch (e) {
        console.error(e);
        console.log("env:");
        console.log(env);
        throw e;
    }
}

/**
 * Функция читает данные из файла
 * @param path Путь к файлу
 */
function readDataFromFileSync(path) {
    return JSON.parse(fs.readFileSync(path));
}

/**
 * Функция сохраняет данные в файл
 * @param path Путь к файлу
 * @param data данные
 */
function writeDataToFileSync(path, data) {
    fs.writeFileSync(path, JSON.stringify(data));
}

function getConfig() {
    return getConfigFromArgv(process.argv);
}

function waitForTransactions(web3, txObj) {

    let txHashes = Array.isArray(txObj) ? txObj : [txObj];

    //Пока есть хотя бы одна невыполненная транзакция, ждем
    while (txHashes.find((txHash) => {
        web3.eth.getTransactionReceipt(txHash) == null
    }) != undefined) {
        //do nothing
    }
}


module.exports = {
    delaySync: delaySync,
    execProcessSync: execProcessSync,
    getConfigFromArgv: getConfigFromArgv,
    getConfigFromEnv: getConfigFromEnv,
    readDataFromFileSync: readDataFromFileSync,
    writeDataToFileSync: writeDataToFileSync,
    getConfig: getConfig,
    waitForTransactions: waitForTransactions
};