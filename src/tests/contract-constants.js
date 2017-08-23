let BigNumber = require('bignumber.js');

class ContractConstants {



    constructor(contract) {

        this.INITIAL_COINS_FOR_VIPPLACEMENT = contract.INITIAL_COINS_FOR_VIPPLACEMENT();
        this.DURATION_VIPPLACEMENT = contract.DURATION_VIPPLACEMENT();
        this.EMISSION_FOR_PRESALE = contract.EMISSION_FOR_PRESALE();
        this.DURATION_PRESALE = contract.DURATION_PRESALE();
        this.RATE_PRESALE = contract.RATE_PRESALE();
        this.DURATION_SALESTAGES = contract.DURATION_SALESTAGES();
        this.RATE_SALESTAGE1 = contract.RATE_SALESTAGE1();
        this.EMISSION_FOR_SALESTAGE1 = contract.EMISSION_FOR_SALESTAGE1();
        this.RATE_SALESTAGE2 = contract.RATE_SALESTAGE2();
        this.EMISSION_FOR_SALESTAGE2 = contract.EMISSION_FOR_SALESTAGE2();
        this.RATE_SALESTAGE3 = contract.RATE_SALESTAGE3();
        this.EMISSION_FOR_SALESTAGE3 = contract.EMISSION_FOR_SALESTAGE3();
        this.RATE_SALESTAGE4 = contract.RATE_SALESTAGE4();
        this.EMISSION_FOR_SALESTAGE4 = contract.EMISSION_FOR_SALESTAGE4();
        this.DURATION_SALESTAGE5 = contract.DURATION_SALESTAGE5();
        this.RATE_SALESTAGE5 = contract.RATE_SALESTAGE5();
        this.EMISSION_FOR_SALESTAGE5 = contract.EMISSION_FOR_SALESTAGE5();
        this.DURATION_NONUSETEAM = contract.DURATION_NONUSETEAM();
        this.BOUNTY_POINTS_SIZE = contract.BOUNTY_POINTS_SIZE();
        this.PRIZE_SIZE_FORGOTO = contract.PRIZE_SIZE_FORGOTO();

    }
}

module.exports = ContractConstants;


