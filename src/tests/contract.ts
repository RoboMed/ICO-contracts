import {BigNumber} from 'bignumber.js';

/**
 * Интерфейс options вызова методов контракта
 */
export interface TxParams {
	from: string;
	gas: number;
	value?: BigNumber;
}

/**
 * Функция для получения options вызова методов контракта
 * @param {string} addr Адрес вызывающего
 * @param {BigNumber} value Value
 * @returns {TxParams}
 */
export function txParams(addr: string, value?: BigNumber): TxParams {
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
	INITIAL_COINS_FOR_VIPPLACEMENT(): BigNumber;

	/**
	 * Длительность стадии VipPlacement
	 */
	DURATION_VIPPLACEMENT(): BigNumber;

	//end VipPlacement constants

	//PreSale constants

	/**
	 * Количество токенов для стадии PreSale
	 */
	EMISSION_FOR_PRESALE(): BigNumber;

	/**
	 * Длительность стадии PreSale
	 */
	DURATION_PRESALE(): BigNumber;

	/**
	 * Курс стадии PreSale
	 */
	RATE_PRESALE(): BigNumber;

	//end PreSale constants

	//SaleStage1 constants

	/**
	 * Общая длительность стадий Sale с SaleStage1 по SaleStage4 включительно
	 */
	DURATION_SALESTAGES (): BigNumber;

	/**
	 * Курс стадии SaleStage1
	 */
	RATE_SALESTAGE1(): BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage1
	 */
	EMISSION_FOR_SALESTAGE1 (): BigNumber;

	//end SaleStage1 constants

	//SaleStage2 constants

	/**
	 * Курс стадии SaleStage2
	 */
	RATE_SALESTAGE2 (): BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage2
	 */
	EMISSION_FOR_SALESTAGE2 (): BigNumber;

	//end SaleStage2 constants

	//SaleStage3 constants

	/**
	 * Курс стадии SaleStage3
	 */
	RATE_SALESTAGE3 (): BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage3
	 */
	EMISSION_FOR_SALESTAGE3 (): BigNumber;

	//end SaleStage3 constants

	//SaleStage4 constants

	/**
	 * Курс стадии SaleStage4
	 */
	RATE_SALESTAGE4 (): BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage4
	 */
	EMISSION_FOR_SALESTAGE4 (): BigNumber;

	//end SaleStage4 constants

	//SaleStage5 constants

	/**
	 * Длительность стадии SaleStage5
	 */
	DURATION_SALESTAGE5 (): BigNumber;

	/**
	 * Курс стадии SaleStage5
	 */
	RATE_SALESTAGE5 (): BigNumber;

	/**
	 * Эмиссия токенов для стадии SaleStage5
	 */
	EMISSION_FOR_SALESTAGE5 (): BigNumber;

	//end SaleStage5 constants

	//PostIco constants

	/**
	 * Длительность периода на который нельзя использовать team токены, полученные при распределении
	 */
	DURATION_NONUSETEAM (): BigNumber;

	//end PostIco constants

	/**
	 * Максимально доступное количество очков баунти
	 */
	BOUNTY_POINTS_SIZE(): BigNumber;

	/**
	 * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
	 */
	PRIZE_SIZE_FORGOTO (): BigNumber;

	/**
	 * Владелец контракта - распределяет вип токены, начисляет баунти и team, осуществляет переход по стадиям,
	 * совместно с _coOwner выполняет выведение eth после наступления PostIco
	 */
	owner(): string;

	/**
	 * Участник контракта -  выводит eth после наступления PostIco, совместно с withdrawal2
	 */
	withdrawal1(): string;

	/**
	 * Участник контракта - только при его участии может быть выведены eth после наступления PostIco, совместно с withdrawal1
	 */
	withdrawal2(): string;

	/**
	 * Адрес на счёте которого находятся нераспределённые bounty токены
	 */
	bountyTokensAccount(): string;

	/**
	 * Адрес на счёте которого находятся нераспределённые team токены
	 */
	teamTokensAccount(): string;

	/**
	 *Адрес на который инициирован вывод eth (владельцем)
	 */
	withdrawalTo(): string;

	/**
	 * Количество eth который предполагается выводить на адрес withdrawalTo
	 */
	withdrawalValue(): BigNumber;

	/**
	 * Количество нераспределённых токенов bounty
	 * */
	bountyTokensNotDistributed(): BigNumber;

	/**
	 * Количество нераспределённых токенов team
	 */
	teamTokensNotDistributed(): BigNumber;

	/**
	 * Текущее состояние
	 */
	currentState(): BigNumber;

	/**
	 * Количество собранного эфира
	 */
	totalBalance(): BigNumber;

	/**
	 * Количество свободных токенов (никто ими не владеет)
	 */
	freeMoney(): BigNumber;

	/**
	 * Общее количество выпущенных токенов
	 * */
	totalSupply(): BigNumber;

	/**
	 * Общее количество купленных токенов
	 * */
	totalBought(): BigNumber;

	/**
	 * Количество нераспределённых баунти очков
	 * */
	bountyPointsNotDistributed(): BigNumber;

	/**
	 * Количество не распределённых токенов от стадии VipPlacement
	 */
	vipPlacementNotDistributed(): BigNumber;

	/**
	 * Дата окончания стадии VipPlacement
	 */
	endDateOfVipPlacement(): BigNumber;

	/**
	 * Дата окончания стадии PreSale
	 */
	endDateOfPreSale(): BigNumber;

	/**
	 * Дата начала стадии SaleStageLast
	 */
	startDateOfSaleStageLast(): BigNumber;

	/**
	 * Дата окончания стадии SaleStageLast
	 */
	endDateOfSaleStageLast(): BigNumber;


	/**
	 * Остаток нераспроданных токенов для состояний с SaleStage1 по SaleStage7, которые переходят в свободные на момент наступления SaleStageLast
	 */
	remForSalesBeforeStageLast(): BigNumber;

	/**
	 * Дата, начиная с которой можно получить team токены непосредственно на кошелёк
	 */
	startDateOfUseTeamTokens(): BigNumber;

	/**
	 * Дата, начиная с которой можно восстановить-перевести нераспроданные токены unsoldTokens
	 */
	startDateOfRestoreUnsoldTokens(): BigNumber;

	/**
	 * Количество нераспроданных токенов на момент наступления PostIco
	 */
	unsoldTokens(): BigNumber;

	/**
	 * How many token units a buyer gets per wei
	 */
	rate(): BigNumber;

	/**
	 * Метод получающий количество начисленных премиальных токенов
	 */
	teamBalanceOf(_owner: string): BigNumber;

	/**
	 * Метод зачисляющий предварительно распределённые team токены на кошелёк
	 */
	accrueTeamTokens(params: TxParams): void;

	/**
	 * Метод проверяющий возможность восстановления нераспроданных токенов
	 */
	canRestoreUnsoldTokens(): boolean;

	/**
	 * Метод выполняющий восстановление нераспроданных токенов
	 */
	restoreUnsoldTokens(_to: string, params: TxParams): string;

	/**
	 * Метод переводящий контракт в следующее доступное состояние,
	 * Для выяснения возможности перехода можно использовать метод canGotoState
	 */
	gotoNextState(params: TxParams): string;

	/**
	 * Инициация снятия эфира на указанный кошелёк
	 */
	initWithdrawal(_to: string, _value: BigNumber, params: TxParams): string;

	/**
	 * Подтверждение снятия эфира на указанный кошелёк
	 */
	approveWithdrawal(_to: string, _value: BigNumber, params: TxParams): string;

	/**
	 * Метод проверяющий возможность перехода в указанное состояние
	 */
	canGotoState(toState: BigNumber): boolean;

	/**
	 * Метод покупки токенов
	 */
	buyTokens(beneficiary: string, params: TxParams): string;

	/**
	 * Метод выполняющий выдачу баунти-токенов на указанный адрес
	 */
	transferBounty(_to: string, _value: BigNumber, params: TxParams): string;

	/**
	 * Метод выполняющий выдачу баунти-токенов на указанный адрес
	 */
	transferTeam(_to: string, _value: BigNumber, params: TxParams): string;

	/**
	 * Function that is called when a user or another contract wants to transfer funds .
	 */
	transfer(_to: string, _value: BigNumber, _data: any, _custom_fallback: string): string;

	/**
	 * Function that is called when a user or another contract wants to transfer funds .
	 */
	transfer(_to: string, _value: BigNumber, _data: any): string;

	/**
	 * @dev transfer token for a specified address
	 * @param _to The address to transfer to.
	 * @param _value The amount to be transferred.
	 */
	transfer(_to: string, _value: BigNumber, params: TxParams): string;

	/**
	 * @dev Gets the balance of the specified address.
	 * @param _owner The address to query the the balance of.
	 * @return An uint256 representing the amount owned by the passed address.
	 */
	balanceOf(_owner: string): BigNumber;

	/**
	 * @dev Transfer tokens from one address to another
	 * @param _from address The address which you want to send tokens from
	 * @param _to address The address which you want to transfer to
	 * @param _value uint256 the amout of tokens to be transfered
	 */
	transferFrom(_from: string, _to: string, _value: BigNumber, params: TxParams): boolean;

	/**
	 * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
	 * @param _spender The address which will spend the funds.
	 * @param _value The amount of tokens to be spent.
	 */
	approve(_spender: string, _value: BigNumber, params: TxParams): boolean;

	/**
	 * @dev Function to check the amount of tokens that an owner allowed to a spender.
	 * @param _owner address The address which owns the funds.
	 * @param _spender address The address which will spend the funds.
	 * @return A uint256 specifing the amount of tokens still available for the spender.
	 */
	allowance(_owner: string, _spender: string): BigNumber;
}