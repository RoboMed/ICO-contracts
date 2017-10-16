import {bnWr, BnWr} from "./bn-wr";

export class ContractConstants {

	//<editor-fold desc="VipPlacement constants">

	/**
	 * Количество токенов для стадии VipPlacement
	 */
	public INITIAL_COINS_FOR_VIPPLACEMENT: BnWr;

	/**
	 * Длительность стадии VipPlacement
	 */
	public DURATION_VIPPLACEMENT: BnWr;

	//</editor-fold>

	//<editor-fold desc="PreSale constants">

	/**
	 * Количество токенов для стадии PreSale
	 */
	public EMISSION_FOR_PRESALE: BnWr;

	/**
	 * Длительность стадии PreSale
	 */
	public DURATION_PRESALE: BnWr;

	/**
	 * Курс стадии PreSale
	 */
	public RATE_PRESALE: BnWr;

	//</editor-fold>

	//<editor-fold desc="SaleStage1 constants">

	/**
	 * Общая длительность стадий Sale с SaleStage1 по SaleStage4 включительно
	 */
	public DURATION_SALESTAGES: BnWr;

	/**
	 * Курс стадии SaleStage1
	 */
	public RATE_SALESTAGE1: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage1
	 */
	public EMISSION_FOR_SALESTAGE1: BnWr;

	//</editor-fold>

	//<editor-fold desc="SaleStage2 constants">

	/**
	 * Курс стадии SaleStage2
	 */
	public RATE_SALESTAGE2: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage2
	 */
	public EMISSION_FOR_SALESTAGE2: BnWr;

	//</editor-fold>

	//<editor-fold desc="SaleStage3 constants">

	/**
	 * Курс стадии SaleStage3
	 */
	public RATE_SALESTAGE3: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage3
	 */
	public EMISSION_FOR_SALESTAGE3: BnWr;

	//</editor-fold>

	//<editor-fold desc="SaleStage4 constants">

	/**
	 * Курс стадии SaleStage4
	 */
	public RATE_SALESTAGE4: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage4
	 */
	public EMISSION_FOR_SALESTAGE4: BnWr;

	//</editor-fold>

	//<editor-fold desc="SaleStage5 constants">

	/**
	 * Курс стадии SaleStage5
	 */
	public RATE_SALESTAGE5: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	public EMISSION_FOR_SALESTAGE5: BnWr;

	//</editor-fold>

	/**
	 * Курс стадии SaleStage6
	 */
	public RATE_SALESTAGE6: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage6
	 */
	public EMISSION_FOR_SALESTAGE6: BnWr;

	//</editor-fold>

	/**
	 * Курс стадии SaleStage7
	 */
	public RATE_SALESTAGE7: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage7
	 */
	public EMISSION_FOR_SALESTAGE7: BnWr;

	//</editor-fold>

	//</editor-fold>

	/**
	 * Длительность стадии SaleStageLast
	 */
	public DURATION_SALESTAGELAST: BnWr;

	/**
	 * Курс стадии SaleStageLast
	 */
	public RATE_SALESTAGELAST: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStageLast
	 */
	public EMISSION_FOR_SALESTAGELAST: BnWr;

	//</editor-fold>


	//<editor-fold desc="PostIco constants">

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	public DURATION_NONUSETEAM: BnWr;

	/**
	 * Длительность периода на который нельзя восстановить нераспроданные unsoldTokens токены,
	 * отсчитывается после наступления PostIco
	 */
	public DURATION_BEFORE_RESTORE_UNSOLD: BnWr;

	//</editor-fold>

	/**
	 * Эмиссия токенов для BOUNTY
	 */
	public EMISSION_FOR_BOUNTY: BnWr;

	/**
	 * Эмиссия токенов для TEAM
	 */
	public EMISSION_FOR_TEAM: BnWr;

	constructor(contract: any) {

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
		this.RATE_SALESTAGE5 = bnWr(contract.RATE_SALESTAGE5());
		this.EMISSION_FOR_SALESTAGE5 = bnWr(contract.EMISSION_FOR_SALESTAGE5());

		//SALESTAGE6
		this.RATE_SALESTAGE6 = bnWr(contract.RATE_SALESTAGE6());
		this.EMISSION_FOR_SALESTAGE6 = bnWr(contract.EMISSION_FOR_SALESTAGE6());

		//SALESTAGE7
		this.RATE_SALESTAGE7 = bnWr(contract.RATE_SALESTAGE7());
		this.EMISSION_FOR_SALESTAGE7 = bnWr(contract.EMISSION_FOR_SALESTAGE7());

		//SALESTAGELAST
		this.DURATION_SALESTAGELAST = bnWr(contract.DURATION_SALESTAGELAST());
		this.RATE_SALESTAGELAST = bnWr(contract.RATE_SALESTAGELAST());
		this.EMISSION_FOR_SALESTAGELAST = bnWr(contract.EMISSION_FOR_SALESTAGELAST());

		this.DURATION_NONUSETEAM = bnWr(contract.DURATION_NONUSETEAM());
		this.DURATION_BEFORE_RESTORE_UNSOLD = bnWr(contract.DURATION_BEFORE_RESTORE_UNSOLD());
		this.EMISSION_FOR_BOUNTY = bnWr(contract.EMISSION_FOR_BOUNTY());
		this.EMISSION_FOR_TEAM = bnWr(contract.EMISSION_FOR_TEAM());
	}
}


