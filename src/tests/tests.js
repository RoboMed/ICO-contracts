module.exports = {
    initTest: initTest,
};

function initTest(contract, config, testData) {
    console.log("initTest");

    //Проверяем что контракт создался
    if(contract == null) console.error(contract == null);

    console.log(contract);
}

