var fs = require('fs');
var child_process = require('child_process');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// Compile
child_process.exec('build.bat', function(error, stdout, stderr) {
    console.log(stdout);
});

var abi = fs.readFileSync('out/RobomedIco.abi');
var compiled = '0x' + fs.readFileSync("out/RobomedIco.bin");

// let's assume that coinbase is our account
web3.eth.defaultAccount = web3.eth.coinbase;

web3.personal.unlockAccount(web3.eth.defaultAccount, "12345");

//Load Contract
var myContract;
web3.eth.contract(abi).new({data: compiled, gas: 2000000}, function (err, contract) {
    if(err) {
        console.error(err);
        return;
        // callback fires twice, we only want the second call when the contract is deployed
    } else if(contract.address){
        myContract = contract;
        console.log('address: ' + myContract.address);
    }
});

//Call Contract
//var res = myContract.multiply(param);
//console.log(res);

