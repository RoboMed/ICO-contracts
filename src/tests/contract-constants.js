let BigNumber = require('bignumber.js');

module.exports = {
    //VipPlacement constants
    /**
     * Количество токенов для стадии VipPlacement x
     */
    INITIAL_COINS_FOR_VIPPLACEMENT: new BigNumber(250000000).mul(new BigNumber(10).pow(18)),

    /**
     * Длительность стадии VipPlacement
     */
    DURATION_VIPPLACEMENT: new Date(1 * 60 * 1000)//  1 minute;
};
