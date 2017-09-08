import * as BigNumber from 'bignumber.js';

/**
 * Интерфейс options вызова методов контракта
 */
export interface TxParams {
	from: string;
	gas: number;
	value?: BigNumber.BigNumber;
}

/**
 * Функция для получения options вызова методов контракта
 * @param {string} addr Адрес вызывающего
 * @param {BigNumber.BigNumber} value Value
 * @returns {TxParams}
 */
export function txParams(addr: string, value?: BigNumber.BigNumber): TxParams {
	let res: TxParams = {from: addr, gas: 2000000};
	if (value != null) {
		res = {
			...res,
			value: value
		};
	}
	return res;
}

export interface Contract {

	//VipPlacement constants
	/**
	 * Количество токенов для стадии VipPlacement x
	 */
	INITIAL_COINS_FOR_VIPPLACEMENT(): BigNumber.BigNumber;

	/**
	 * Длительность стадии VipPlacement
	 */
	DURATION_VIPPLACEMENT(): BigNumber.BigNumber;

	//end VipPlacement constants

	//PreSale constants

	/**
	 * Количество токенов для стадии PreSale
	 */
	EMISSION_FOR_PRESALE(): BigNumber.BigNumber;

	/**
	 * Длительность стадии PreSale
	 */
	DURATION_PRESALE(): BigNumber.BigNumber;

	/**
	 * Курс стадии PreSale
	 */
	RATE_PRESALE(): BigNumber.BigNumber;

	//end PreSale constants

	//SaleStage1 constants

	/**
	 * Общая длительность стадий Sale с SaleStage1 по SaleStage4 включительно
	 */
	DURATION_SALESTAGES (): BigNumber.BigNumber;

	/**
	 * Курс стадии SaleStage1
	 */
	RATE_SALESTAGE1(): BigNumber.BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage1
	 */
	EMISSION_FOR_SALESTAGE1 (): BigNumber.BigNumber;

	//end SaleStage1 constants

	//SaleStage2 constants

	/**
	 * Курс стадии SaleStage2
	 */
	RATE_SALESTAGE2 (): BigNumber.BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage2
	 */
	EMISSION_FOR_SALESTAGE2 (): BigNumber.BigNumber;

	//end SaleStage2 constants

	//SaleStage3 constants

	/**
	 * Курс стадии SaleStage3
	 */
	RATE_SALESTAGE3 (): BigNumber.BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage3
	 */
	EMISSION_FOR_SALESTAGE3 (): BigNumber.BigNumber;

	//end SaleStage3 constants

	//SaleStage4 constants

	/**
	 * Курс стадии SaleStage4
	 */
	RATE_SALESTAGE4 (): BigNumber.BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage4
	 */
	EMISSION_FOR_SALESTAGE4 (): BigNumber.BigNumber;

	//end SaleStage4 constants

	//SaleStage5 constants

	/**
	 * Длительность стадии SaleStage5
	 */
	DURATION_SALESTAGE5 (): BigNumber.BigNumber;

	/**
	 * Курс стадии SaleStage5
	 */
	RATE_SALESTAGE5 (): BigNumber.BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	EMISSION_FOR_SALESTAGE5 (): BigNumber.BigNumber;

	//end SaleStage5 constants

	//PostIco constants

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	DURATION_NONUSETEAM (): BigNumber.BigNumber;

	//end PostIco constants

	/**
	 * Максимально доступное количество очков баунти
	 */
	BOUNTY_POINTS_SIZE(): BigNumber.BigNumber;

	/**
	 * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
	 */
	PRIZE_SIZE_FORGOTO (): BigNumber.BigNumber;

	/**
	 * Адрес на счёте которого находятся нераспределённые bounty токены
	 */
	bountyTokensAccount(): string;

	/**
	 * Адрес на счёте которого находятся нераспределённые team токены
	 */
	teamTokensAccount(): string;

	/**
	 * Количество нераспределённых токенов bounty
	 * */
	bountyTokensNotDistributed(): BigNumber.BigNumber;

	/**
	 * Количество нераспределённых токенов team
	 */
	teamTokensNotDistributed(): BigNumber.BigNumber;

	/**
	 * Текущее состояние
	 */
	currentState(): BigNumber.BigNumber;

	/**
	 * Количество собранного эфира
	 */
	totalBalance(): BigNumber.BigNumber;

	/**
	 * Количество свободных токенов (никто ими не владеет)
	 */
	freeMoney(): BigNumber.BigNumber;

	/**
	 * Общее количество выпущенных токенов
	 * */
	totalSupply(): BigNumber.BigNumber;

	/**
	 * Общее количество купленных токенов
	 * */
	totalBought(): BigNumber.BigNumber;

	/**
	 * Количество нераспределённых баунти очков
	 * */
	bountyPointsNotDistributed(): BigNumber.BigNumber;

	/**
	 * Количество не распределённых токенов от стадии VipPlacement
	 */
	vipPlacementNotDistributed(): BigNumber.BigNumber;

	/**
	 * Дата окончания стадии VipPlacement
	 */
	endDateOfVipPlacement(): BigNumber.BigNumber;

	/**
	 * Дата окончания стадии PreSale
	 */
	endDateOfPreSale(): BigNumber.BigNumber;

	/**
	 * Дата начала стадии SaleStageLast
	 */
	startDateOfSaleStageLast(): BigNumber.BigNumber;

	/**
	 * Дата окончания стадии SaleStageLast
	 */
	endDateOfSaleStageLast(): BigNumber.BigNumber;


	/**
	 * Остаток нераспроданных токенов для состояний с SaleStage1 по SaleStage7, которые переходят в свободные на момент наступления SaleStageLast
	 */
	remForSalesBeforeStageLast(): BigNumber.BigNumber;

	/**
	 * Дата, начиная с которой можно получить team токены непосредственно на кошелёк
	 */
	startDateOfUseTeamTokens(): BigNumber.BigNumber;

	/**
	 * How many token units a buyer gets per wei
	 */
	rate(): BigNumber.BigNumber;

	/**
	 * Метод получающий количество начисленных премиальных токенов
	 */
	teamBalanceOf(_owner : string): BigNumber.BigNumber;

	/**
	 * Метод зачисляющий предварительно распределённые team токены на кошелёк
	 */
	accrueTeamTokens(params: TxParams): void;

	/**
	 * Метод переводящий контракт в следующее доступное состояние,
	 * если переход состоялся, вызывающий метод получает приз в размере PRIZE_SIZE_FORGOTO
	 * Для выяснения возможности перехода можно использовать метод canGotoState
	 */
	gotoNextStateAndPrize(params: TxParams): string;

	/**
	 * Снятие эфира на кошелёк владельца
	 */
	ownerWithdrawal(value: BigNumber.BigNumber): void;

	/**
	 * Метод проверяющий возможность перехода в указанное состояние
	 */
	canGotoState(toState: BigNumber.BigNumber): boolean;

	/**
	 * Метод покупки токенов
	 */
	buyTokens(beneficiary: string, params: TxParams): string;

	/**
	 * Метод выполняющий выдачу баунти-токенов на указанный адрес
	 */
	transferBounty(_to: string, _value: BigNumber.BigNumber, params: TxParams): string;

	/**
	 * Метод выполняющий выдачу баунти-токенов на указанный адрес
	 */
	transferTeam(_to: string, _value: BigNumber.BigNumber, params: TxParams): string;

	/**
	 * @dev transfer token for a specified address
	 * @param _to The address to transfer to.
	 * @param _value The amount to be transferred.
	 */
	transfer(_to: string, _value: BigNumber.BigNumber, params: TxParams): string;


	/**
	 * @dev Gets the balance of the specified address.
	 * @param _owner The address to query the the balance of.
	 * @return An uint256 representing the amount owned by the passed address.
	 */
	balanceOf(_owner: string): BigNumber.BigNumber;

	/**
	 * @dev Transfer tokens from one address to another
	 * @param _from address The address which you want to send tokens from
	 * @param _to address The address which you want to transfer to
	 * @param _value uint256 the amout of tokens to be transfered
	 */
	transferFrom(_from: string, _to: string, _value: BigNumber.BigNumber, params: TxParams): boolean;

	/**
	 * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
	 * @param _spender The address which will spend the funds.
	 * @param _value The amount of tokens to be spent.
	 */
	approve(_spender: string, _value: BigNumber.BigNumber, params: TxParams): boolean;

	/**
	 * @dev Function to check the amount of tokens that an owner allowed to a spender.
	 * @param _owner address The address which owns the funds.
	 * @param _spender address The address which will spend the funds.
	 * @return A uint256 specifing the amount of tokens still available for the spender.
	 */
	allowance(_owner: string, _spender: string): BigNumber.BigNumber;
}