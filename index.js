var fs = require('fs');
var child_process = require('child_process');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


/**
 * Функция для компилирования sol файлов
 * @returns {Promise.<void>}
 */
function compileSol() {
    child_process.execSync('build.bat', function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
}

/**
 * Функция для загрузки контракта в сеть
 * @param address The address where the contract is deployed
 * @param from The address transactions should be made from
 * @param gas The maximum gas provided for a transaction (gas limit)
 * @returns Contract object
 */
function loadContract(address, from, gas) {
    let abi = fs.readFileSync('out/RobomedIco.abi');
    let compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

    let isReady = false;

    let myContract;
    web3.eth.contract(abi).new({
        data: compiled,
        address: address,
        from: from,
        gas: gas
    }, function (err, contract) {
        if (err) {
            console.error(err);
            // callback fires twice, we only want the second call when the contract is deployed
        } else if (contract.address) {
            myContract = contract;
            console.log('address: ' + myContract.address);
            isReady = true;
        }
    });

    while (!isReady) {
        /*async из коробки не работает*/
    }

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
    let contract = loadContract(testData.owner.addr, testData.owner.addr, 2000000);

    console.log(contract);

    // тестируем
    // ...
}

// run({
//     owner: {addr: "0xe14a7b4c1bc52a4aec121bf32697541444b1f622"},
//     user1: {addr: "0xe14a7b4c1bc52a4aec121bf32697541444b1f622"},
//     user2: {addr: "0xe14a7b4c1bc52a4aec121bf32697541444b1f622"},
// });


