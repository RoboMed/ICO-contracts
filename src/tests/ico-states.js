let BigNumber = require('bignumber.js');

class IcoStates {

    /**
     * Состояние для которого выполняется заданная эмиссия на кошелёк владельца,
     * далее все выпущенные токены распределяются владельцем из своего кошелька на произвольные кошельки, распределение может происходить всегда.
     * Владелец не может распределить из своего кошелька, количество превышающее INITIAL_COINS_FOR_VIPPLACEMENT до прекращения ICO
     * Состояние завершается по наступлению времени VipPlacementEndDate
     */
    get VipPlacement() {
        return new BigNumber(0);
    }

    /**
     * Состояние для которого выполняется заданная эмиссия в свободный пул freeMoney.
     * далее все выпущенные свободные токены покупаются всеми желающими вплоть до endDateOfPreSale,
     * не выкупленные токены будут выставлены на стадии SaleStage5
     * Состояние завершается по наступлению времени endDateOfPreSale.
     */
    get PreSale() {
        return new BigNumber(1);
    }

    /**
     * Состояние представляющее из себя подстадию продаж,
     * при наступлении данного состояния выпускается заданное количество токенов,
     * количество свободных токенов приравнивается к этой эмиссии
     * Состояние завершается при выкупе всех свободных токенов или по наступлению времени startDateOfSaleStage5.
     * Если выкупаются все свободные токены - переход осуществляется на следующую стадию -
     * например [с SaleStage1 на SaleStage2] или [с SaleStage2 на SaleStage3]
     * Если наступает время startDateOfSaleStage5, то независимо от выкупленных токенов переходим на стостояние SaleStage5
     * С момента наступления SaleStage1 покупка токенов становиться разрешена
     */
    get SaleStage1() {
        return new BigNumber(2);
    }

    /**
     * Аналогично SaleStage1
     */
    get SaleStage2() {
        return new BigNumber(3);
    }

    /**
     * Аналогично SaleStage1
     */
    get SaleStage3() {
        return new BigNumber(4);
    }

    /**
     * Аналогично SaleStage1
     */
    get SaleStage4() {
        return new BigNumber(5);
    }

    /**
     * Состояние представляющее из себя последнюю подстадию продаж,
     * при наступлении данного состояния выпускается заданное количество токенов,
     * количество свободных токенов приравнивается к этой эмиссии,
     * плюс остатки нераспроданных токенов со стадии PreSale и стадий SaleStage1,SaleStage2,SaleStage3,SaleStage4
     * Состояние завершается по наступлению времени endDateOfSaleStage5.
     */
    get SaleStage5() {
        return new BigNumber(6);
    }

    /**
     * Состояние наступающее после завершения Ico,
     * при наступлении данного состояния свободные токены уничтожаются,
     * также происходит бонусное распределение дополнительных токенов Bounty и Team,
     * С момента наступления PostIco покупка токенов невозможна
     */
    get PostIco() {
        return new BigNumber(7);
    }

}

module.exports = new IcoStates();