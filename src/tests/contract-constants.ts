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
	 * Длительность стадии SaleStage2
	 */
	public DURATION_SALESTAGE2: BnWr;

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
	 * Длительность стадии SaleStage3
	 */
	public DURATION_SALESTAGE3: BnWr;

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
	 * Длительность стадии SaleStage4
	 */
	public DURATION_SALESTAGE4: BnWr;

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
	 * Длительность стадии SaleStage5
	 */
	public DURATION_SALESTAGE5: BnWr;

	/**
	 * Курс стадии SaleStage5
	 */
	public RATE_SALESTAGE5: BnWr;

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	public EMISSION_FOR_SALESTAGE5: BnWr;

	//</editor-fold>

	//<editor-fold desc="PostIco constants">

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	public DURATION_NONUSETEAM: BnWr;

	//</editor-fold>

	/**
	 *Максимально доступное количество очков баунти
	 */
	public BOUNTY_POINTS_SIZE: BnWr;

	/**
	 * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
	 */
	public PRIZE_SIZE_FORGOTO: BnWr;

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


