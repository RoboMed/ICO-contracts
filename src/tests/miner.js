let u = require('./u');

class Miner {

    start() {

        let exec = "\"miner.start(1)\"";
        let cmd = "geth attach --exec " + exec;

        u.execProcessSync(cmd);
    }

    stop() {

        let exec = "\"miner.stop();\"";

        let cmd = "geth attach --exec " + exec;

        u.execProcessSync(cmd);
    }

}

module.exports = Miner;



