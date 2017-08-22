let child_process = require('child_process');
let fs = require('fs');

module.exports = {

    delaySync: function (ms = 0) {
        let dt = new Date();
        while ((new Date()) - dt <= ms) { /* Do nothing */
        }
        //return new Promise(resolve => setTimeout(resolve, ms));
    },

    execProcessSync: function (cmd) {
        child_process.execSync(cmd, function (error, stdout, stderr) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
        });
    },

    getConfigFromArgv: function (argv) {

        let params = argv[2];
        let configFile = params.split("=")[1];
        let data = fs.readFileSync(configFile);
        let config = JSON.parse(data);

        for (let key in config) {
            if (config.hasOwnProperty(key)) {
                config[key] = config[key].replace(/['"]+/g, '')
            }
        }

        return config;
    },

    readPreparedTestData: function (path) {
        return JSON.parse(fs.readFileSync(path));
    },

    writePreparedTestData: function (path, preparedTestData) {
        fs.writeFileSync(path, JSON.stringify(preparedTestData));
    },
    

};