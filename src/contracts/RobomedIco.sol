pragma solidity ^0.4.11;


import "./zeppelin/SafeMath.sol";
import "./zeppelin/Ownable.sol";
import "./zeppelin/Destructible.sol";
import "./zeppelin/ERC20.sol";


contract RobomedIco is Ownable, Destructible, ERC20 {

  using SafeMath for uint256;






  string public constant name = "RobomedToken";

  string public constant symbol = "RBM";

  uint256 public constant decimals = 18;

  //VipPlacement constants
  /**
   * Количество токенов для стадии VipPlacement x
  */
  uint256 constant INITIAL_COINS_FOR_VIPPLACEMENT = 250000000 * 10 ** 18;

  /**
   * Длительность стадии VipPlacement
  */
  uint256 constant DURATION_VIPPLACEMENT = 1 minutes;//  1 days;

  //end VipPlacement constants

  //PreSale constants

  /**
   * Количество токенов для стадии PreSale
  */
  uint256 constant EMISSION_FOR_PRESALE = 540000000 * 10 ** 18;

  /**
   * Длительность стадии PreSale
  */
  uint256 constant DURATION_PRESALE = 2 minutes;//1 days;

  /**
   * Курс стадии PreSale
  */
  uint256 constant RATE_PRESALE = 3600;

  //end PreSale constants

  //SaleStage1 constants

  /**
   * Общая длительность стадий Sale с SaleStage1 по SaleStage4 включительно
  */
  uint256 constant DURATION_SALESTAGES = 2 minutes;//30 days;

  /**
   * Курс стадии SaleStage1
  */
  uint256 constant RATE_SALESTAGE1 = 3000;

  /**
   * Эмиссия токенов для стадии SaleStage1
  */
  uint256 constant EMISSION_FOR_SALESTAGE1 = 112500000 * 10 ** 18;

  //end SaleStage1 constants

  //SaleStage2 constants

  /**
   * Курс стадии SaleStage2
  */
  uint256 constant RATE_SALESTAGE2 = 2700;

  /**
    * Эмиссия токенов для стадии SaleStage2
    */
  uint256 constant EMISSION_FOR_SALESTAGE2 = 101250000 * 10 ** 18;

  //end SaleStage2 constants

  //SaleStage3 constants

  /**
   * Курс стадии SaleStage3
  */
  uint256 constant RATE_SALESTAGE3 = 2300;

  /**
  * Эмиссия токенов для стадии SaleStage3
  */
  uint256 constant EMISSION_FOR_SALESTAGE3 = 86250000 * 10 ** 18;
  //end SaleStage3 constants

  //SaleStage4 constants

  /**
   * Курс стадии SaleStage4
  */
  uint256 constant RATE_SALESTAGE4 = 2100;

  /**
  * Эмиссия токенов для стадии SaleStage4
  */
  uint256 constant EMISSION_FOR_SALESTAGE4 = 78750000 * 10 ** 18;

  //end SaleStage4 constants

  //SaleStage5 constants

  /**
   * Длительность стадии SaleStage5
  */
  uint256 constant DURATION_SALESTAGE5 = 20 minutes;//10 days;

  /**
   * Курс стадии SaleStage5
  */
  uint256 constant RATE_SALESTAGE5 = 2000;

  /**
  * Эмиссия токенов для стадии SaleStage5
  */
  uint256 constant EMISSION_FOR_SALESTAGE5 = 300000000 * 10 ** 18;
  //end SaleStage5 constants

  //PostIco constants

  /**
   * Длительность периода на который нельзя использовать токены, полученные при Bounty
  */
  uint256 constant DURATION_NONUSEBOUNTY = 20 minutes;//10 days;

  //end PostIco constants

  /**
  * Максимально доступное количество очков баунти
  */
  uint256 constant BOUNTY_POINTS_SIZE = 1000;

  /**
   * Размер премии для аккаунта, с которого успешно выполнили goto на очередную стадию
  */
  uint256 PRIZE_SIZE_FORGOTO = 1000 * 10 ** 18;

  /**
    * Перечисление состояний контракта
    */
  enum IcoStates {

  /**
   * Состояние для которого выполняется заданная эмиссия на кошелёк владельца,
   * далее все выпущенные токены распределяются владельцем из своего кошелька на произвольные кошельки, распределение может происходить всегда.
   * Владелец не может распределить из своего кошелька, количество превышающее INITIAL_COINS_FOR_VIPPLACEMENT до прекращения ICO
   * Состояние завершается по наступлению времени VipPlacementEndDate
   */
  VipPlacement,

  /**
     * Состояние для которого выполняется заданная эмиссия в свободный пул freeMoney.
     * далее все выпущенные свободные токены покупаются всеми желающими вплоть до endDateOfPreSale,
     * не выкупленные токены будут выставлены на стадии SaleStage5
     * Состояние завершается по наступлению времени endDateOfPreSale.
     */
  PreSale,

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
  SaleStage1,

  /**
   * Аналогично SaleStage1
   */
  SaleStage2,

  /**
   * Аналогично SaleStage1
   */
  SaleStage3,

  /**
   * Аналогично SaleStage1
   */
  SaleStage4,

  /**
   * Состояние представляющее из себя последнюю подстадию продаж,
   * при наступлении данного состояния выпускается заданное количество токенов,
   * количество свободных токенов приравнивается к этой эмиссии,
   * плюс остатки нераспроданных токенов со стадии PreSale и стадий SaleStage1,SaleStage2,SaleStage3,SaleStage4
   * Состояние завершается по наступлению времени endDateOfSaleStage5.
  */
  SaleStage5,

  /**
   * Состояние наступающее после завершения Ico,
   * при наступлении данного состояния свободные токены уничтожаются,
   * также происходит бонусное распределение дополнительных токенов Bounty и Team,
   * С момента наступления PostIco покупка токенов невозможна
  */
  PostIco
  }



  mapping (address => uint256) balances;

  mapping (address => mapping (address => uint256)) allowed;

  /**
  * Здесь храним начисленные премиальные токены, могут быть выведены на кошелёк начиная с даты startDateOfUseTeamTokens
  */
  mapping (address => uint256) teamBalances;

  /**
  * Здесь храним начисленные очки баунти
  */
  mapping (address => uint256) bountyPointsBalances;

  /**
    * Текущее состояние
    */
  IcoStates public currentState;

  /**
  * Количество свободных токенов (никто ими не владеет)
  */
  uint256 public freeMoney = 0;

  /**
   * Общее количество выпущенных токенов
   * */
  uint256 public totalSupply = 0;

  /**
   * Общее количество купленных токенов
   * */
  uint256 public totalBought = 0;

  /**
   * Количество нераспределённых баунти очков
   * */
  uint256 public bountyPointsNotDistributed;


  /**
   * Количество не распределённых токенов от стадии VipPlacement
   */
  uint256 public vipPlacementNotDistributed;

  /**
   * Дата окончания стадии VipPlacement
  */
  uint256 public endDateOfVipPlacement;

  /**
   * Дата окончания стадии PreSale
  */
  uint256 public endDateOfPreSale = 0;

  /**
   * Дата начала стадии SaleStage5
  */
  uint256 public startDateOfSaleStage5 = 0;

  /**
   * Дата окончания стадии SaleStage5
  */
  uint256 public endDateOfSaleStage5 = 0;

  /**
   * Остаток нераспроданных токенов для состояния PreSale, которые переходят в свободные на момент наступления SaleStage5
   */
  uint256 public remForPreSale = 0;

  /**
   * Остаток нераспроданных токенов для состояний с SaleStage1 по SaleStage4, которые переходят в свободные на момент наступления SaleStage5
   */
  uint256 public remForSalesBeforeStage5 = 0;

  /**
   * Количество выпущенных премиальных токенов для команды
   */
  uint256 public teamTokens = 0;

  /**
   * Количество выпущенных премиальных токенов для баунти
   */
  uint256 public bountyTokens = 0;

  /**
  * Дата, начиная с которой можно получить team токены непосредственно на кошелёк
  */
  uint256 public startDateOfUseTeamTokens = 0;

  /**
   * How many token units a buyer gets per wei
   */
  uint256 public rate = 0;




  /**
   * Модификатор позволяющий выполнять вызов,
   * только если ico закончилось
   */
  modifier afterIco() {
    require(currentState == IcoStates.PostIco);
    _;
  }

  /**
   * Модификатор позволяющий выполнять вызов,
   * только если ico не закончилось
   */
  modifier beforeIco() {
    require(currentState == IcoStates.PostIco);
    _;
  }

  /**
   * Событие изменения состояния контракта
   */
  event StateChanged(IcoStates state);


  /**
  * @dev Конструктор
  */
  function RobomedIco(){
    balances[owner] = INITIAL_COINS_FOR_VIPPLACEMENT;
    currentState = IcoStates.VipPlacement;
    totalSupply = INITIAL_COINS_FOR_VIPPLACEMENT;
    vipPlacementNotDistributed = INITIAL_COINS_FOR_VIPPLACEMENT;
    endDateOfVipPlacement = now.add(DURATION_VIPPLACEMENT);
    remForSalesBeforeStage5 = 0;
    bountyPointsNotDistributed = BOUNTY_POINTS_SIZE;
  }

  /**
  * Метод зачисляющий предварительно распределённые team токены на кошелёк
  */
  function accrueTeamTokens() afterIco {
    //зачисление возможно только после определённой даты
    require(startDateOfUseTeamTokens <= now);

    //добавляем в общее количество выпущенных
    totalSupply = totalSupply.add(teamBalances[msg.sender]);

    //зачисляем на кошелёк и обнуляем не начисленные
    balances[msg.sender] = balances[msg.sender].add(teamBalances[msg.sender]);
    teamBalances[msg.sender] = 0;
  }

  /**
  * Метод зачисляющий предварительно распределённые bounty токены на кошелёк
  */
  function accrueBountyTokens() afterIco {
    //вычисляем сколько должны выдать токенов
    uint256 tokens = (bountyTokens / BOUNTY_POINTS_SIZE) * bountyPointsBalances[msg.sender];

    //добавляем в общее количество выпущенных
    totalSupply = totalSupply.add(tokens);

    //зачисляем на кошелёк и обнуляем не начисленные
    balances[msg.sender] = balances[msg.sender].add(tokens);
    bountyPointsBalances[msg.sender] = 0;
  }

  /**
   * Метод переводящий контракт в следующее доступное состояние,
   * если переход состоялся, вызывающий метод получает приз в размере PRIZE_SIZE_FORGOTO
   * Для выяснения возможности перехода можно использовать метод canGotoState
  */
  function gotoNextStateAndPrize() returns (bool) {

    if (gotoPreSale() || gotoSaleStage1() || gotoSaleStage5() || gotoPostIco()) {
      //переход состоялся - награждаем вызвавшего функцию
      balances[msg.sender] = balances[msg.sender].add(PRIZE_SIZE_FORGOTO);
      totalSupply = totalSupply.add(PRIZE_SIZE_FORGOTO);
      return true;
    }
    return false;
  }

  /**
  * Метод выполняющий добавление боунти-поинтов на указанный адрес
  */
  function addBounty(address beneficiary, uint256 _value) beforeIco onlyOwner {
    require(beneficiary != 0x0);

    //уменьшаем общее количество доступных очков баунти
    bountyPointsNotDistributed = bountyPointsNotDistributed.sub(_value);

    //зачисляем очки баунти адресату
    bountyPointsBalances[beneficiary] = bountyPointsBalances[beneficiary].add(_value);
  }

  /**
   * Метод проверяющий возможность перехода в указанное состояние
   */
  function canGotoState(IcoStates toState) constant returns (bool){
    if (toState == IcoStates.PreSale) {
      return (currentState == IcoStates.VipPlacement && endDateOfVipPlacement <= now);
    }
    else if (toState == IcoStates.SaleStage1) {
      return (currentState == IcoStates.PreSale && endDateOfPreSale <= now);
    }
    else if (toState == IcoStates.SaleStage2) {
      return (currentState == IcoStates.SaleStage1 && freeMoney == 0 && startDateOfSaleStage5 > now);
    }
    else if (toState == IcoStates.SaleStage3) {
      return (currentState == IcoStates.SaleStage2 && freeMoney == 0 && startDateOfSaleStage5 > now);
    }
    else if (toState == IcoStates.SaleStage4) {
      return (currentState == IcoStates.SaleStage3 && freeMoney == 0 && startDateOfSaleStage5 > now);
    }
    else if (toState == IcoStates.SaleStage5) {
      //переход на состояние SaleStage5 возможен только из состояний SaleStages
      if (
      currentState != IcoStates.SaleStage1
      &&
      currentState != IcoStates.SaleStage2
      &&
      currentState != IcoStates.SaleStage3
      &&
      currentState != IcoStates.SaleStage4) return false;

      //переход осуществляется если на состоянии SaleStage4 не осталось свободных токенов
      //или на одном из состояний SaleStages наступило время startDateOfSaleStage5
      if (!(currentState == IcoStates.SaleStage4 && freeMoney == 0) && startDateOfSaleStage5 > now) {
        return false;
      }
      return true;
    }
    else if (toState == IcoStates.PostIco) {
      return (currentState == IcoStates.SaleStage5 && endDateOfSaleStage5 <= now);
    }
  }


  /**
   * Метод покупки токенов
   */
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(msg.value != 0);

    //покупать токены можно только на указанных стадиях
    require(
    currentState == IcoStates.PreSale
    ||
    currentState == IcoStates.SaleStage1
    ||
    currentState == IcoStates.SaleStage2
    ||
    currentState == IcoStates.SaleStage3
    ||
    currentState == IcoStates.SaleStage4
    ||
    currentState == IcoStates.SaleStage5
    );

    //выполняем покупку для вызывающего
    uint256 weiAmount = msg.value;
    uint256 tokens = weiAmount.mul(rate);
    freeMoney = freeMoney.sub(tokens);
    totalBought = totalBought.add(tokens);
    balances[beneficiary] = balances[beneficiary].add(tokens);

    //если покупка была выполнена на PreSale
    if (currentState == IcoStates.PreSale) {
      //уменьшаем количество остатка по токенам которые необходимо продать на PreSale
      remForPreSale = remForPreSale.sub(tokens);
    }
    //если покупка была выполнена на любой из стадий Sale кроме последней
    else if (
    currentState == IcoStates.SaleStage1
    ||
    currentState == IcoStates.SaleStage2
    ||
    currentState == IcoStates.SaleStage3
    ||
    currentState == IcoStates.SaleStage4) {

      //уменьшаем количество остатка по токенам которые необходимо продать на этих стадиях
      remForSalesBeforeStage5 = remForSalesBeforeStage5.sub(tokens);

      //пробуем перейти между SaleStages
      transitionBetweenSaleStages();
    }
  }






  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) returns (bool) {
    if (currentState == IcoStates.PostIco) {
      balances[msg.sender] = balances[msg.sender].sub(_value);
      balances[_to] = balances[_to].add(_value);
    }
    else {
      //переводить деньги до ico может только владелец
      require(msg.sender == owner);

      //проверяем кошелёк назначения
      require(_to != 0x0 && _to != owner);

      //общая сумма переводов от владельца (до завершения) ico не может превышать InitialCoinsFor_VipPlacement
      vipPlacementNotDistributed = vipPlacementNotDistributed.sub(_value);
      balances[_to] = balances[_to].add(_value);
      balances[msg.sender] = balances[msg.sender].sub(_value);
    }

    Transfer(msg.sender, _to, _value);
    return true;
  }


  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */
  function transferFrom(address _from, address _to, uint256 _value) afterIco returns (bool) {

    var _allowance = allowed[_from][msg.sender];

    // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    // require (_value <= _allowance);

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = _allowance.sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) afterIco returns (bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

  /**
  * Вспомогательный метод выставляющий количество свободных токенов, рейт и добавляющий количество эмитированных
  */
  function setMoney(uint256 _freeMoney, uint256 _emission, uint256 _rate) private {
    freeMoney = _freeMoney;
    totalSupply = totalSupply.add(_emission);
    rate = _rate;
  }

  /**
   * Метод переводящий контракт в состояние PreSale
   */
  function gotoPreSale() private returns (bool) {

    //проверяем возможность перехода
    if (!canGotoState(IcoStates.PreSale)) return false;

    //да нужно переходить

    //переходим в PreSale
    currentState = IcoStates.PreSale;

    //выставляем состояние токенов
    setMoney(EMISSION_FOR_PRESALE, EMISSION_FOR_PRESALE, RATE_PRESALE);

    //остаток не распроданных токенов на PreSale - равен размеру их эмиссии
    remForPreSale = EMISSION_FOR_PRESALE;


    //устанавливаем дату окончания PreSale
    endDateOfPreSale = now.add(DURATION_PRESALE);

    //разим событие изменения состояния
    StateChanged(IcoStates.PreSale);
    return true;
  }

  /**
  * Метод переводящий контракт в состояние SaleStage1
  */
  function gotoSaleStage1() private returns (bool) {
    //проверяем возможность перехода
    if (!canGotoState(IcoStates.SaleStage1)) return false;

    //да нужно переходить

    //переходим в SaleStage1
    currentState = IcoStates.SaleStage1;

    //выставляем состояние токенов
    setMoney(EMISSION_FOR_SALESTAGE1, EMISSION_FOR_SALESTAGE1, RATE_SALESTAGE1);

    //определяем количество токенов которое можно продать на всех стадиях Sale кроме последней
    remForSalesBeforeStage5 = EMISSION_FOR_SALESTAGE1 + EMISSION_FOR_SALESTAGE2 + EMISSION_FOR_SALESTAGE3 + EMISSION_FOR_SALESTAGE4;

    //устанавливаем дату начала последней стадии продаж
    startDateOfSaleStage5 = now.add(DURATION_SALESTAGES);

    //разим событие изменения состояния
    StateChanged(IcoStates.SaleStage1);
    return true;
  }

  /**
   * Метод выполняющий переход между состояниями Sale
   */
  function transitionBetweenSaleStages() private {
    //переход между состояниями SaleStages возможен только если находимся в одном из них, кроме последнего
    if (
    currentState != IcoStates.SaleStage1
    &&
    currentState != IcoStates.SaleStage2
    &&
    currentState != IcoStates.SaleStage3
    &&
    currentState != IcoStates.SaleStage4) return;

    //если есть возможность сразу переходим в состояние Stage5
    if (gotoSaleStage5()) {
      return;
    }

    //смотрим в какое состояние можем перейти и выполняем переход
    if (canGotoState(IcoStates.SaleStage2)) {
      currentState = IcoStates.SaleStage2;
      setMoney(EMISSION_FOR_SALESTAGE2, EMISSION_FOR_SALESTAGE2, RATE_SALESTAGE2);
      StateChanged(IcoStates.SaleStage2);
    }
    else if (canGotoState(IcoStates.SaleStage3)) {
      currentState = IcoStates.SaleStage3;
      setMoney(EMISSION_FOR_SALESTAGE3, EMISSION_FOR_SALESTAGE3, RATE_SALESTAGE3);
      StateChanged(IcoStates.SaleStage3);
    }
    else if (canGotoState(IcoStates.SaleStage4)) {
      currentState = IcoStates.SaleStage4;
      setMoney(EMISSION_FOR_SALESTAGE4, EMISSION_FOR_SALESTAGE4, RATE_SALESTAGE4);
      StateChanged(IcoStates.SaleStage4);
    }
  }

  /**
    * Метод переводящий контракт в состояние SaleStage5
    */
  function gotoSaleStage5() private returns (bool) {
    if (!canGotoState(IcoStates.SaleStage5)) return false;

    //ок переходим на состояние SaleStage5
    currentState = IcoStates.SaleStage5;

    //выставляем состояние токенов, с учётом всех остатков
    setMoney(remForPreSale + remForSalesBeforeStage5 + EMISSION_FOR_SALESTAGE5, EMISSION_FOR_SALESTAGE5, RATE_SALESTAGE5);


    //устанавливаем дату окончания SaleStage5
    endDateOfSaleStage5 = now.add(DURATION_SALESTAGE5);

    StateChanged(IcoStates.SaleStage5);
    return true;
  }

  /**
    * Метод переводящий контракт в состояние PostIco
    */
  function gotoPostIco() private returns (bool) {
    if (!canGotoState(IcoStates.PostIco)) return false;

    //ок переходим на состояние SaleStage5
    currentState = IcoStates.PostIco;

    //определяем количество премиальных токенов для команды и баунти - на этом этапе они не попадают в выпущенные
    //попадут только при получении
    teamTokens = (totalBought + INITIAL_COINS_FOR_VIPPLACEMENT) / 5;

    bountyTokens = (totalBought + INITIAL_COINS_FOR_VIPPLACEMENT) / 20;


    //уничтожаем свободные токены
    totalSupply = totalSupply.sub(freeMoney);
    setMoney(0, 0, 0);

    //выставляем дату после которой можно использовать премиальные токены
    startDateOfUseTeamTokens = now + DURATION_NONUSEBOUNTY;

    //проводим распределение TeamTokens -

    //member1
    teamBalances[0x0] = teamBalances[0x0].add(teamTokens / 20);

    //member2
    teamBalances[0x0] = teamBalances[0x0].add(teamTokens / 20);


    StateChanged(IcoStates.PostIco);
    return true;
  }



}
