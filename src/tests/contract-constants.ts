import {bnWr} from "./bn-wr";

export class ContractConstants {

	//<editor-fold desc="VipPlacement constants">

	/**
	 * Количество токенов для стадии VipPlacement
	 */
	private _INITIAL_COINS_FOR_VIPPLACEMENT: any;

	/**
	 * Количество токенов для стадии VipPlacement
	 */
	public get INITIAL_COINS_FOR_VIPPLACEMENT() {
		return this._INITIAL_COINS_FOR_VIPPLACEMENT;
	}

	/**
	 * Длительность стадии VipPlacement
	 */
	private _DURATION_VIPPLACEMENT: any;

	/**
	 * Длительность стадии VipPlacement
	 */
	public get DURATION_VIPPLACEMENT() {
		return this._DURATION_VIPPLACEMENT;
	}

	//</editor-fold>

	//<editor-fold desc="PreSale constants">

	/**
	 * Количество токенов для стадии PreSale
	 */
	private _EMISSION_FOR_PRESALE: any;

	/**
	 * Количество токенов для стадии PreSale
	 */
	public get EMISSION_FOR_PRESALE() {
		return this._EMISSION_FOR_PRESALE;
	}

	/**
	 * Длительность стадии PreSale
	 */
	private _DURATION_PRESALE: any;

	/**
	 * Длительность стадии PreSale
	 */
	public get DURATION_PRESALE() {
		return this._DURATION_PRESALE;
	}

	/**
	 * Курс стадии PreSale
	 */
	private _RATE_PRESALE: any;

	/**
	 * Курс стадии PreSale
	 */
	public get RATE_PRESALE() {
		return this._RATE_PRESALE;
	}

	//</editor-fold>

	//<editor-fold desc="SaleStage1 constants">

	/**
	 * Общая длительность стадий Sale с SaleStage1 по SaleStage4 включительно
	 */
	private _DURATION_SALESTAGES: any;

	/**
	 * Длительность стадии SaleStage1
	 */
	public get DURATION_SALESTAGES() {
		return this._DURATION_SALESTAGES;
	}

	/**
	 * Курс стадии SaleStage1
	 */
	private _RATE_SALESTAGE1: any;

	/**
	 * Курс стадии SaleStage1
	 */
	public get RATE_SALESTAGE1() {
		return this._RATE_SALESTAGE1;
	}

	/**
	 * Эмиссия токенов для стадии SaleStage1
	 */
	private _EMISSION_FOR_SALESTAGE1: any;

	/**
	 * Эмиссия токенов для стадии SaleStage1
	 */
	public get EMISSION_FOR_SALESTAGE1() {
		return this._EMISSION_FOR_SALESTAGE2;
	}

	//</editor-fold>

	//<editor-fold desc="SaleStage2 constants">

	/**
	 * Длительность стадии SaleStage2
	 */
	private _DURATION_SALESTAGE2: any;

	/**
	 * Длительность стадии SaleStage2
	 */
	public get DURATION_SALESTAGE2() {
		return this._DURATION_SALESTAGE2;
	}

	/**
	 * Курс стадии SaleStage2
	 */
	private _RATE_SALESTAGE2: any;

	/**
	 * Курс стадии SaleStage2
	 */
	public get RATE_SALESTAGE2() {
		return this._RATE_SALESTAGE2;
	}

	/**
	 * Эмиссия токенов для стадии SaleStage2
	 */
	private _EMISSION_FOR_SALESTAGE2: any;

	/**
	 * Эмиссия токенов для стадии SaleStage2
	 */
	public get EMISSION_FOR_SALESTAGE2() {
		return this._EMISSION_FOR_SALESTAGE2;
	}

	//</editor-fold>

	//<editor-fold desc="SaleStage3 constants">

	/**
	 * Длительность стадии SaleStage3
	 */
	private _DURATION_SALESTAGE3: any;

	/**
	 * Длительность стадии SaleStage3
	 */
	public get DURATION_SALESTAGE3() {
		return this._DURATION_SALESTAGE3;
	}

	/**
	 * Курс стадии SaleStage3
	 */
	private _RATE_SALESTAGE3: any;

	/**
	 * Курс стадии SaleStage3
	 */
	public get RATE_SALESTAGE3() {
		return this._RATE_SALESTAGE3;
	}

	/**
	 * Эмиссия токенов для стадии SaleStage3
	 */
	private _EMISSION_FOR_SALESTAGE3: any;

	/**
	 * Эмиссия токенов для стадии SaleStage3
	 */
	public get EMISSION_FOR_SALESTAGE3() {
		return this._EMISSION_FOR_SALESTAGE3;
	}

	//</editor-fold>

	//<editor-fold desc="SaleStage4 constants">

	/**
	 * Длительность стадии SaleStage4
	 */
	private _DURATION_SALESTAGE4: any;

	/**
	 * Длительность стадии SaleStage4
	 */
	public get DURATION_SALESTAGE4() {
		return this._DURATION_SALESTAGE4;
	}

	/**
	 * Курс стадии SaleStage4
	 */
	private _RATE_SALESTAGE4: any;

	/**
	 * Курс стадии SaleStage4
	 */
	public get RATE_SALESTAGE4() {
		return this._RATE_SALESTAGE4;
	}

	/**
	 * Эмиссия токенов для стадии SaleStage4
	 */
	private _EMISSION_FOR_SALESTAGE4: any;

	/**
	 * Эмиссия токенов для стадии SaleStage4
	 */
	public get EMISSION_FOR_SALESTAGE4() {
		return this._EMISSION_FOR_SALESTAGE4;
	}

	//</editor-fold>

	//<editor-fold desc="SaleStage5 constants">

	/**
	 * Длительность стадии SaleStage5
	 */
	private _DURATION_SALESTAGE5: any;

	/**
	 * Длительность стадии SaleStage5
	 */
	public get DURATION_SALESTAGE5() {
		return this._DURATION_SALESTAGE5;
	}

	/**
	 * Курс стадии SaleStage5
	 */
	private _RATE_SALESTAGE5: any;

	/**
	 * Курс стадии SaleStage5
	 */
	public get RATE_SALESTAGE5() {
		return this._RATE_SALESTAGE5;
	}

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	private _EMISSION_FOR_SALESTAGE5: any;

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	public get EMISSION_FOR_SALESTAGE5() {
		return this._EMISSION_FOR_SALESTAGE5;
	}

	//</editor-fold>

	//<editor-fold desc="PostIco constants">

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	private _DURATION_NONUSETEAM: any;

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	public get DURATION_NONUSETEAM() {
		return this._DURATION_NONUSETEAM;
	}

	//</editor-fold>

	/**
	 *Максимально доступное количество очков баунти
	 */
	private _BOUNTY_POINTS_SIZE: any;

	/**
	 *Максимально доступное количество очков баунти
	 */
	public get BOUNTY_POINTS_SIZE() {
		return this._PRIZE_SIZE_FORGOTO;
	}


	/**
	 * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
	 */
	private _PRIZE_SIZE_FORGOTO: any;

	/**
	 * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
	 */
	public get PRIZE_SIZE_FORGOTO() {
		return this._PRIZE_SIZE_FORGOTO;
	}


	constructor(contract: any) {

		//VIPPLACEMENT
		this._INITIAL_COINS_FOR_VIPPLACEMENT = bnWr(contract.INITIAL_COINS_FOR_VIPPLACEMENT());
		this._DURATION_VIPPLACEMENT = bnWr(contract.DURATION_VIPPLACEMENT());

		//PRESALE
		this._EMISSION_FOR_PRESALE = bnWr(contract.EMISSION_FOR_PRESALE());
		this._DURATION_PRESALE = bnWr(contract.DURATION_PRESALE());
		this._RATE_PRESALE = bnWr(contract.RATE_PRESALE());

		//SALESTAGE1
		this._DURATION_SALESTAGES = bnWr(contract.DURATION_SALESTAGES());
		this._RATE_SALESTAGE1 = bnWr(contract.RATE_SALESTAGE1());
		this._EMISSION_FOR_SALESTAGE1 = bnWr(contract.EMISSION_FOR_SALESTAGE1());

		//SALESTAGE2
		this._RATE_SALESTAGE2 = bnWr(contract.RATE_SALESTAGE2());
		this._EMISSION_FOR_SALESTAGE2 = bnWr(contract.EMISSION_FOR_SALESTAGE2());

		//SALESTAGE3
		this._RATE_SALESTAGE3 = bnWr(contract.RATE_SALESTAGE3());
		this._EMISSION_FOR_SALESTAGE3 = bnWr(contract.EMISSION_FOR_SALESTAGE3());

		//SALESTAGE4
		this._RATE_SALESTAGE4 = bnWr(contract.RATE_SALESTAGE4());
		this._EMISSION_FOR_SALESTAGE4 = bnWr(contract.EMISSION_FOR_SALESTAGE4());

		//SALESTAGE5
		this._DURATION_SALESTAGE5 = bnWr(contract.DURATION_SALESTAGE5());
		this._RATE_SALESTAGE5 = bnWr(contract.RATE_SALESTAGE5());
		this._EMISSION_FOR_SALESTAGE5 = bnWr(contract.EMISSION_FOR_SALESTAGE5());

		//BOUNTY_POINTS
		this._DURATION_NONUSETEAM = bnWr(contract.DURATION_NONUSETEAM());
		this._BOUNTY_POINTS_SIZE = bnWr(contract.BOUNTY_POINTS_SIZE());

		//PRIZE_SIZE_FORGOTO
		this._PRIZE_SIZE_FORGOTO = bnWr(contract.PRIZE_SIZE_FORGOTO());

	}
}


