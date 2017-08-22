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

function readPreparedTestData(path) {
    return JSON.parse(fs.readFileSync(path));
}

function writePreparedTestData(path, preparedTestData) {
    fs.writeFileSync(path, JSON.stringify(preparedTestData));
}

function getConfig() {
    return getConfigFromArgv(process.argv);
}


module.exports = {
    delaySync: delaySync,
    execProcessSync: execProcessSync,
    getConfigFromArgv: getConfigFromArgv,
    readPreparedTestData: readPreparedTestData,
    writePreparedTestData: writePreparedTestData,
    getConfig: getConfig
};