module.exports = {
    delaySync: function (ms = 0) {
        let dt = new Date();
        while ((new Date()) - dt <= ms) { /* Do nothing */ }
        //return new Promise(resolve => setTimeout(resolve, ms));
    }
};