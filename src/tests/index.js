let fs = require('fs');
let child_process = require('child_process');
let config = require('./config');
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


/**
 * Функция для компилирования sol файлов
 * @returns {Promise.<void>}
 */
function compileSol() {
    console.log("compileSol started...");
    child_process.execSync('../../build.bat', function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
    console.log("compileSol finished");
}

/**
 * Функция для загрузки контракта в сеть
 * @param from The address transactions should be made from
 * @returns Contract object
 */
function loadContract(from) {

    console.log("loadContract started...");

    let abi = fs.readFileSync('out/RobomedIco.abi');
    let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

    let gasEstimate = web3.eth.estimateGas({data: compiled});
    console.log("gasEstimate: " + gasEstimate);

    let isReady = false;

    web3.eth.defaultAccount = from;
    web3.personal.unlockAccount(web3.eth.defaultAccount, config.accountPass);
    console.log("unlockAccount: " + web3.eth.defaultAccount);

    let myContract;
    web3.eth.contract(abi).new({
        data: compiled,
        //from: from,
        gas: gasEstimate
    }, function (err, contract) {
        if (err) {
            console.error(err);
            isReady = true;
            // callback fires twice, we only want the second call when the contract is deployed
        }
        else if (!contract.address) {
            console.log('contract: ');
            console.log(myContract);
            isReady = true;
        }
        else if (contract.address) {
            myContract = contract;
            console.log('address: ' + myContract.address);
            isReady = true;
        }
    });

    while (!isReady) {
        /*async из коробки не работает*/
    }

    console.log("loadContract finished");

    return myContract;
}

/**
 * Функция для
 * @param testData
 */
function run(testData) {
    // компилируем
    compileSol();
    // загружаем в сеть
    //let contract = loadContract(testData.owner.addr);

    console.log("contract: ");
    console.log(contract);

    // тестируем
    // ...
    test1(contract, testData);
}

run({
    owner: {addr: '0xb07aa1c1bd0604ab3390131771fc117f54d7fd28'},
    user1: {addr: '0xe05e692eef35a895883c3874111bdbf8755910a6'},
    user2: {addr: '0xc4fff507d1f1dba6f41bdf7a713bd5d4384f4fa7'}
});


function test1(contract, testData) {

}



