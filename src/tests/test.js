let assert = require("assert");
let prepare_net = require("./prepare-net");
let deploy_to_target = require("./deploy-to-target");
let contract_constants = require("./contract-constants");
let fs = require('fs');
let u = require('./u');
let Web3 = require('web3');

const timeout = 100000;

let web3 = null;
let contract = null;
let config = null;
let abi = null;
let contractAddress = null;

describe('Test stage1', () => {


    before(function () {
        // runs before all tests in this block
        console.log("Test before");

        config = u.getConfigFromArgv(process.argv);
        web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress));

        assert.ok(config != undefined);
        assert.ok(web3 != undefined);
    });

    beforeEach(function (done) {
        console.log("beforeEach");

        this.timeout(timeout);

        // prepare_net.init();
        // deploy_to_target.init().then(c => {
        //     contract = c;
        //     assert.ok(contract.address);
        //     done()
        // });

        let preparedData = {
            owner: "22",
            user1: "22",
            user2: "22"
        };

        // web3.personal.unlockUser(preparedData.user1, config.accountPass);


        abi = fs.readFileSync('out/RobomedIco.abi');
        contractAddress = "0x904e181c3dbe9f4eaa852c0c4e236f1f3683b12c";
        contract = web3.eth.contract(abi).at(contractAddress);
        assert.ok(contract.address);

        done();
    });

    //https://github.com/mochajs/mocha/issues/1904
    it('test InitContractState', function () {
        let balance = web3.fromWei(web3.eth.getBalance(contract.address).toNumber());
        //let res = contract.canGotoState.call(1);

       // console.log(contract);


        //web.eth.contract(abi).at(contractAddress).canGotoState.call(1);

       // contract.canGotoState.call().then(function (r) {
        //    console.log(r);
        //});

        //console.log(contract);

       // let balanceRobomedToken = contract.balanceOf(contract.address).then(function (v) {

        //    console.log(v);
       // });

        //console.log(balance);
    });
});