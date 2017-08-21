var Web3 = require('web3');
var ttt = require('./src/test');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

console.log("start...");
ttt.test();
//web3.personal.newAccount("12345");
//console.log(web3.personal);