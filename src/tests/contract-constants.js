let BigNumber = require('bignumber.js');
let bnWr = require("./bn-wr");


class ContractConstants {

    constructor(contract) {

        //VIPPLACEMENT
        this.INITIAL_COINS_FOR_VIPPLACEMENT = bnWr(contract.INITIAL_COINS_FOR_VIPPLACEMENT());
        this.DURATION_VIPPLACEMENT = bnWr(contract.DURATION_VIPPLACEMENT());

        //PRESALE
        this.EMISSION_FOR_PRESALE = bnWr(contract.EMISSION_FOR_PRESALE());
        this.DURATION_PRESALE = bnWr(contract.DURATION_PRESALE());
        this.RATE_PRESALE = bnWr(contract.RATE_PRESALE());

        //SALESTAGE1
        this.DURATION_SALESTAGES = bnWr(contract.DURATION_SALESTAGES());
        this.RATE_SALESTAGE1 = bnWr(contract.RATE_SALESTAGE1());
        this.EMISSION_FOR_SALESTAGE1 = bnWr(contract.EMISSION_FOR_SALESTAGE1());

        //SALESTAGE2
        this.RATE_SALESTAGE2 = bnWr(contract.RATE_SALESTAGE2());
        this.EMISSION_FOR_SALESTAGE2 = bnWr(contract.EMISSION_FOR_SALESTAGE2());

        //SALESTAGE3
        this.RATE_SALESTAGE3 = bnWr(contract.RATE_SALESTAGE3());
        this.EMISSION_FOR_SALESTAGE3 = bnWr(contract.EMISSION_FOR_SALESTAGE3());

        //SALESTAGE4
        this.RATE_SALESTAGE4 = bnWr(contract.RATE_SALESTAGE4());
        this.EMISSION_FOR_SALESTAGE4 = bnWr(contract.EMISSION_FOR_SALESTAGE4());

        //SALESTAGE5
        this.DURATION_SALESTAGE5 = bnWr(contract.DURATION_SALESTAGE5());
        this.RATE_SALESTAGE5 = bnWr(contract.RATE_SALESTAGE5());
        this.EMISSION_FOR_SALESTAGE5 = bnWr(contract.EMISSION_FOR_SALESTAGE5());

        //BOUNTY_POINTS
        this.DURATION_NONUSETEAM = bnWr(contract.DURATION_NONUSETEAM());
        this.BOUNTY_POINTS_SIZE = bnWr(contract.BOUNTY_POINTS_SIZE());

        //PRIZE_SIZE_FORGOTO
        this.PRIZE_SIZE_FORGOTO = bnWr(contract.PRIZE_SIZE_FORGOTO());

    }
}

module.exports = ContractConstants;


