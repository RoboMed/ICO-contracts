pragma solidity ^0.4.11;


import "./zeppelin/SafeMath.sol";
import "./zeppelin/ERC20.sol";
import "./zeppelin/ERC223.sol";
import "./zeppelin/ContractReceiver.sol";


contract RobomedIco is ERC223, ERC20 {

  using SafeMath for uint256;

  string public name = "RobomedToken";

  string public symbol = "RBM";

  uint8 public decimals = 18;

  //VipPlacement constants
  /**
   * Количество токенов для стадии VipPlacement
  */
  uint256 public constant INITIAL_COINS_FOR_VIPPLACEMENT = 25 * 10 ** 18;

  /**
   * Длительность стадии VipPlacement
  */
  uint256 public constant DURATION_VIPPLACEMENT = 1 seconds;// 1 minutes;//  1 days;

  //end VipPlacement constants

  //PreSale constants

  /**
   * Количество токенов для стадии PreSale
  */
  uint256 public constant EMISSION_FOR_PRESALE = 54 * 10 ** 18;

  /**
   * Длительность стадии PreSale
  */
  uint256 public constant DURATION_PRESALE = 1 seconds;//2 minutes;//1 days;

  /**
   * Курс стадии PreSale
  */
  uint256 public constant RATE_PRESALE = 36;

  //end PreSale constants

  //SaleStage1 constants

  /**
   * Общая длительность стадий Sale с SaleStage1 по SaleStage7 включительно
  */
  uint256 public constant DURATION_SALESTAGES = 1 minutes;//2 minutes;//30 days;

  /**
   * Курс стадии SaleStage1
  */
  uint256 public constant RATE_SALESTAGE1 = 30;

  /**
   * Эмиссия токенов для стадии SaleStage1
  */
  uint256 public constant EMISSION_FOR_SALESTAGE1 = 100;

  //end SaleStage1 constants

  //SaleStage2 constants

  /**
   * Курс стадии SaleStage2
  */
  uint256 public constant RATE_SALESTAGE2 = 27;

  /**
  * Эмиссия токенов для стадии SaleStage2
  */
  uint256 public constant EMISSION_FOR_SALESTAGE2 = 200;

  //end SaleStage2 constants

  //SaleStage3 constants

  /**
   * Курс стадии SaleStage3
  */
  uint256 public constant RATE_SALESTAGE3 = 23;

  /**
  * Эмиссия токенов для стадии SaleStage3
  */
  uint256 public constant EMISSION_FOR_SALESTAGE3 = 300;
  //end SaleStage3 constants

  //SaleStage4 constants

  /**
   * Курс стадии SaleStage4
  */
  uint256 public constant RATE_SALESTAGE4 = 21;

  /**
  * Эмиссия токенов для стадии SaleStage4
  */
  uint256 public constant EMISSION_FOR_SALESTAGE4 = 400;

  //end SaleStage4 constants


  //SaleStage5 constants

  /**
   * Курс стадии SaleStage5
  */
  uint256 public constant RATE_SALESTAGE5 = 21;

  /**
  * Эмиссия токенов для стадии SaleStage5
  */
  uint256 public constant EMISSION_FOR_SALESTAGE5 = 500;

  //end SaleStage5 constants



  //SaleStage6 constants

  /**
   * Курс стадии SaleStage6
  */
  uint256 public constant RATE_SALESTAGE6 = 21;

  /**
  * Эмиссия токенов для стадии SaleStage6
  */
  uint256 public constant EMISSION_FOR_SALESTAGE6 = 600;

  //end SaleStage6 constants


  //SaleStage7 constants

  /**
   * Курс стадии SaleStage7
  */
  uint256 public constant RATE_SALESTAGE7 = 21;

  /**
  * Эмиссия токенов для стадии SaleStage7
  */
  uint256 public constant EMISSION_FOR_SALESTAGE7 = 700;

  //end SaleStage7 constants


  //SaleStageLast constants

  /**
   * Длительность стадии SaleStageLast
  */
  uint256 public constant DURATION_SALESTAGELAST = 20 seconds;//10 days;

  /**
   * Курс стадии SaleStageLast
  */
  uint256 public constant RATE_SALESTAGELAST = 20;

  /**
  * Эмиссия токенов для стадии SaleStageLast
  */
  uint256 public constant EMISSION_FOR_SALESTAGELAST = 800;
  //end SaleStageLast constants

  //PostIco constants

  /**
   * Длительность периода на который нельзя использовать team токены, полученные при распределении
  */
  uint256 public constant DURATION_NONUSETEAM = 30 seconds;// minutes;//10 days;

  //end PostIco constants

  /**
  * Эмиссия токенов для BOUNTY
  */
  uint256 public constant EMISSION_FOR_BOUNTY = 1 * 10 ** 18;

  /**
  * Эмиссия токенов для TEAM
  */
  uint256 public constant EMISSION_FOR_TEAM = 1 * 10 ** 18;


  /**
    * Перечисление состояний контракта
    */
  enum IcoStates {

  /**
   * Состояние для которого выполняется заданная эмиссия на кошелёк владельца,
   * далее все выпущенные токены распределяются владельцем из своего кошелька на произвольные кошельки, распределение может происходить всегда.
   * Владелец не может распределить из своего кошелька, количество превышающее INITIAL_COINS_FOR_VIPPLACEMENT до прекращения ICO
   * Состояние завершается по наступлению времени endDateOfVipPlacement
   */
  VipPlacement,

  /**
     * Состояние для которого выполняется заданная эмиссия в свободный пул freeMoney.
     * далее все выпущенные свободные токены покупаются всеми желающими вплоть до endDateOfPreSale,
     * не выкупленные токены будут уничтожены
     * Состояние завершается по наступлению времени endDateOfPreSale.
     * С момента наступления PreSale покупка токенов становиться разрешена
     */
  PreSale,

  /**
   * Состояние представляющее из себя подстадию продаж,
   * при наступлении данного состояния выпускается заданное количество токенов,
   * количество свободных токенов приравнивается к этой эмиссии
   * Состояние завершается при выкупе всех свободных токенов или по наступлению времени startDateOfSaleStageLast.
   * Если выкупаются все свободные токены - переход осуществляется на следующую стадию -
   * например [с SaleStage1 на SaleStage2] или [с SaleStage2 на SaleStage3]
   * Если наступает время startDateOfSaleStageLast, то независимо от выкупленных токенов переходим на стостояние SaleStageLast
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
   * Аналогично SaleStage1
   */
  SaleStage5,

  /**
   * Аналогично SaleStage1
   */
  SaleStage6,

  /**
   * Аналогично SaleStage1
   */
  SaleStage7,

  /**
   * Состояние представляющее из себя последнюю подстадию продаж,
   * при наступлении данного состояния выпускается заданное количество токенов,
   * количество свободных токенов приравнивается к этой эмиссии,
   * плюс остатки нераспроданных токенов со стадий SaleStage1,SaleStage2,SaleStage3,SaleStage4,SaleStage5,SaleStage6,SaleStage7
   * Состояние завершается по наступлению времени endDateOfSaleStageLast.
  */
  SaleStageLast,

  /**
   * Состояние наступающее после завершения Ico,
   * при наступлении данного состояния свободные токены уничтожаются,
   * также происходит бонусное распределение дополнительных токенов Bounty и Team,
   * С момента наступления PostIco покупка токенов невозможна
  */
  PostIco
  }


  /**
  * Здесь храним балансы токенов
  */
  mapping (address => uint256)  balances;

  mapping (address => mapping (address => uint256))  allowed;

  /**
  * Здесь храним начисленные премиальные токены, могут быть выведены на кошелёк начиная с даты startDateOfUseTeamTokens
  */
  mapping (address => uint256) teamBalances;

  /**
  * Владелец контракта - распределяет вип токены, начисляет баунти и team, осуществляет переход по стадиям,
  * совместно с _coOwner выполняет выведение eth после наступления PostIco
  */
  address public owner;

  /**
  * Совладелец контракта - только при его участии может быть выведены eth после наступления PostIco
  */
  address public coOwner;

  /**
  * Адрес на счёте которого находятся нераспределённые bounty токены
  */
  address public bountyTokensAccount;

  /**
  * Адрес на счёте которого находятся нераспределённые team токены
  */
  address public teamTokensAccount;

  /**
  *Адрес на который инициирован вывод eth (владельцем)
  */
  address public withdrawalTo;

  /**
  * Количество eth который предполагается выводить на адрес withdrawalTo
  */
  uint256 public withdrawalValue;

  /**
   * Количество нераспределённых токенов bounty
   * */
  uint256 public bountyTokensNotDistributed;

  /**
   * Количество нераспределённых токенов team
   * */
  uint256 public teamTokensNotDistributed;

  /**
    * Текущее состояние
    */
  IcoStates public currentState;

  /**
  * Количество собранного эфира
  */
  uint256 public totalBalance;

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
   * Дата начала стадии SaleStageLast
  */
  uint256 public startDateOfSaleStageLast;

  /**
   * Дата окончания стадии SaleStageLast
  */
  uint256 public endDateOfSaleStageLast = 0;


  /**
   * Остаток нераспроданных токенов для состояний с SaleStage1 по SaleStage7, которые переходят в свободные на момент наступления SaleStageLast
   */
  uint256 public remForSalesBeforeStageLast = 0;

  /**
  * Дата, начиная с которой можно получить team токены непосредственно на кошелёк
  */
  uint256 public startDateOfUseTeamTokens = 0;

  /**
   * How many token units a buyer gets per wei
   */
  uint256 public rate = 0;


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Throws if called by any account other than the coOwner.
   */
  modifier onlyCoOwner() {
    require(msg.sender == coOwner);
    _;
  }

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
    require(currentState != IcoStates.PostIco);
    _;
  }

  /**
  * Модификатор проверяющий допустимость операций transfer
  */
  modifier checkForTransfer(address _from, address _to, uint256 _value)  {

    //проверяем размер перевода
    require(_value > 0);

    //проверяем кошелёк назначения
    require(_to != 0x0 && _to != _from);

    //на стадиях перед ico переводить может только владелец
    require(currentState == IcoStates.PostIco || _from == owner);

    //операции на bounty и team не допустимы до окончания ico
    require(currentState == IcoStates.PostIco || (_to != bountyTokensAccount && _to != teamTokensAccount));

    _;
  }



  /**
   * Событие изменения состояния контракта
   */
  event StateChanged(IcoStates state);


  /**
   * Событие покупки токенов
   */
  event Buy(address beneficiary, uint256 boughtTokens, uint256 ethValue);

  /**
  * @dev Конструктор
  * _owner - владелец контракта - распределяет вип токены, начисляет баунти и team, осуществляет переход по стадиям,
  * совместно с _coOwner выполняет выведение eth после наступления PostIco
  * _coOwner - совладелец контракта - только при его участии может быть выведены eth после наступления PostIco
  */
  function RobomedIco(address _owner, address _coOwner, address _bountyTokensAccount, address _teamTokensAccount){

    //проверяем, что все указанные адреса не равны 0, также они отличаются от создающего контракт
    //по сути контракт создаёт некое 3-ее лицо не имеющее в дальнейшем ни каких особенных прав
    //так же действует условие что все перичисленные адреса разные (нельзя быть одновременно владельцем и кошельком для токенов - например)
    require(_owner != 0x0 && _owner != msg.sender);
    require(_coOwner != 0x0 && _coOwner != msg.sender);
    require(_bountyTokensAccount != 0x0 && _bountyTokensAccount != msg.sender);
    require(_teamTokensAccount != 0x0 && _teamTokensAccount != msg.sender);

    require(_bountyTokensAccount != _teamTokensAccount);
    require(_owner != _teamTokensAccount);
    require(_owner != _bountyTokensAccount);
    require(_coOwner != _owner);
    require(_coOwner != _bountyTokensAccount);
    require(_coOwner != _teamTokensAccount);

    //выставляем адреса
    owner = _owner;
    coOwner = _coOwner;
    bountyTokensAccount = _bountyTokensAccount;
    teamTokensAccount = _teamTokensAccount;

    //устанавливаем начальное значение на предопределённых аккаунтах
    balances[owner] = INITIAL_COINS_FOR_VIPPLACEMENT;
    balances[bountyTokensAccount] = EMISSION_FOR_BOUNTY;
    balances[teamTokensAccount] = EMISSION_FOR_TEAM;

    //нераспределённые токены
    bountyTokensNotDistributed = EMISSION_FOR_BOUNTY;
    teamTokensNotDistributed = EMISSION_FOR_TEAM;
    vipPlacementNotDistributed = INITIAL_COINS_FOR_VIPPLACEMENT;

    currentState = IcoStates.VipPlacement;
    totalSupply = INITIAL_COINS_FOR_VIPPLACEMENT + EMISSION_FOR_BOUNTY + EMISSION_FOR_TEAM;

    endDateOfVipPlacement = now.add(DURATION_VIPPLACEMENT);
    remForSalesBeforeStageLast = 0;
  }

  /**
  * Function to access name of token .
  */
  function name() constant returns (string) {
    return name;
  }

  /**
  * Function to access symbol of token .
  */
  function symbol() constant returns (string) {
    return symbol;
  }

  /**
  * Function to access decimals of token .
  */
  function decimals() constant returns (uint8) {
    return decimals;
  }


  /**
  * Function to access total supply of tokens .
  */
  function totalSupply() constant returns (uint256) {
    return totalSupply;
  }

  /**
  * Метод получающий количество начисленных премиальных токенов
  */
  function teamBalanceOf(address _owner) constant returns (uint256){
    return teamBalances[_owner];
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
   * Метод переводящий контракт в следующее доступное состояние,
   * Для выяснения возможности перехода можно использовать метод canGotoState
  */
  function gotoNextState() onlyOwner returns (bool)  {

    if (gotoPreSale() || gotoSaleStage1() || gotoSaleStageLast() || gotoPostIco()) {
      return true;
    }
    return false;
  }


  /**
  * Инициация снятия эфира на указанный кошелёк
  */
  function initWithdrawal(address _to, uint256 _value) afterIco onlyOwner {
    withdrawalTo = _to;
    withdrawalValue = _value;
  }

  /**
  * Подтверждение снятия эфира на указанный кошелёк
  */
  function approveWithdrawal(address _to, uint256 _value) afterIco onlyCoOwner {
    require(_to != 0x0 && _value > 0);
    require(_to == withdrawalTo);
    require(_value == withdrawalValue);

    totalBalance = totalBalance.sub(_value);
    withdrawalTo.transfer(_value);

    withdrawalTo = 0x0;
    withdrawalValue = 0;
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
      return (currentState == IcoStates.SaleStage1 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStage3) {
      return (currentState == IcoStates.SaleStage2 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStage4) {
      return (currentState == IcoStates.SaleStage3 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStage5) {
      return (currentState == IcoStates.SaleStage4 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStage6) {
      return (currentState == IcoStates.SaleStage5 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStage7) {
      return (currentState == IcoStates.SaleStage6 && freeMoney == 0 && startDateOfSaleStageLast > now);
    }
    else if (toState == IcoStates.SaleStageLast) {
      //переход на состояние SaleStageLast возможен только из состояний SaleStages
      if (
      currentState != IcoStates.SaleStage1
      &&
      currentState != IcoStates.SaleStage2
      &&
      currentState != IcoStates.SaleStage3
      &&
      currentState != IcoStates.SaleStage4
      &&
      currentState != IcoStates.SaleStage5
      &&
      currentState != IcoStates.SaleStage6
      &&
      currentState != IcoStates.SaleStage7) return false;

      //переход осуществляется если на состоянии SaleStage7 не осталось свободных токенов
      //или на одном из состояний SaleStages наступило время startDateOfSaleStageLast
      if (!(currentState == IcoStates.SaleStage7 && freeMoney == 0) && startDateOfSaleStageLast > now) {
        return false;
      }

      return true;
    }
    else if (toState == IcoStates.PostIco) {
      return (currentState == IcoStates.SaleStageLast && endDateOfSaleStageLast <= now);
    }
  }

  /**
  * Fallback функция - из неё по сути просто происходит вызов покупки токенов для отправителя
  */
  function() payable {
    buyTokens(msg.sender);
  }

  /**
   * Метод покупки токенов
   */
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(msg.value != 0);

    //нельзя покупать на токены bounty и team
    require(beneficiary != bountyTokensAccount && beneficiary != teamTokensAccount);

    //выставляем остаток средств
    //в процессе покупки будем его уменьшать на каждой итерации - итерация - покупка токенов на определённой стадии
    //суть - если покупающий переводит количество эфира,
    //большее чем возможное количество свободных токенов на определённой стадии,
    //то выполняется переход на следующую стадию (курс тоже меняется)
    //и на остаток идёт покупка на новой стадии и т.д.
    //если же в процессе покупке все свободные токены израсходуются (со всех допустимых стадий)
    //будет выкинуто исключение
    uint256 remVal = msg.value;

    //увеличиваем количество эфира пришедшего к нам
    totalBalance = totalBalance.add(msg.value);

    //общее количество токенов которые купили за этот вызов
    uint256 boughtTokens = 0;

    while (remVal > 0) {
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
      ||
      currentState == IcoStates.SaleStage6
      ||
      currentState == IcoStates.SaleStage7
      ||
      currentState == IcoStates.SaleStageLast
      );

      //выполняем покупку для вызывающего
      //смотрим, есть ли у нас такое количество свободных токенов на текущей стадии
      uint256 tokens = remVal.mul(rate);
      if (tokens > freeMoney) {
        remVal = remVal.sub(freeMoney.div(rate));
        tokens = freeMoney;
      }
      else
      {
        remVal = 0;
        //если остаток свободных токенов меньше чем курс - отдаём их покупателю
        uint256 remFreeTokens = freeMoney.sub(tokens);
        if (0 < remFreeTokens && remFreeTokens < rate) {
          tokens = freeMoney;
        }
      }
      assert(tokens > 0);

      freeMoney = freeMoney.sub(tokens);
      totalBought = totalBought.add(tokens);
      balances[beneficiary] = balances[beneficiary].add(tokens);
      boughtTokens = boughtTokens.add(tokens);

      //если покупка была выполнена на любой из стадий Sale кроме последней
      if (
      currentState == IcoStates.SaleStage1
      ||
      currentState == IcoStates.SaleStage2
      ||
      currentState == IcoStates.SaleStage3
      ||
      currentState == IcoStates.SaleStage4
      ||
      currentState == IcoStates.SaleStage5
      ||
      currentState == IcoStates.SaleStage6
      ||
      currentState == IcoStates.SaleStage7) {

        //уменьшаем количество остатка по токенам которые необходимо продать на этих стадиях
        remForSalesBeforeStageLast = remForSalesBeforeStageLast.sub(tokens);

        //пробуем перейти между SaleStages
        transitionBetweenSaleStages();
      }
    }

    Buy(beneficiary, boughtTokens, msg.value);

  }

  /**
  * Метод выполняющий выдачу баунти-токенов на указанный адрес
  */
  function transferBounty(address _to, uint256 _value) onlyOwner {
    //проверяем кошелёк назначения
    require(_to != 0x0 && _to != msg.sender);

    //уменьшаем количество нераспределённых
    bountyTokensNotDistributed = bountyTokensNotDistributed.sub(_value);

    //переводим с акаунта баунти на акаунт назначения
    balances[_to] = balances[_to].add(_value);
    balances[bountyTokensAccount] = balances[bountyTokensAccount].sub(_value);

    Transfer(bountyTokensAccount, _to, _value);
  }

  /**
  * Метод выполняющий выдачу баунти-токенов на указанный адрес
  */
  function transferTeam(address _to, uint256 _value) onlyOwner {
    //проверяем кошелёк назначения
    require(_to != 0x0 && _to != msg.sender);

    //уменьшаем количество нераспределённых
    teamTokensNotDistributed = teamTokensNotDistributed.sub(_value);

    //переводим с акаунта team на team акаунт назначения
    teamBalances[_to] = teamBalances[_to].add(_value);
    balances[teamTokensAccount] = balances[teamTokensAccount].sub(_value);

    //убираем токены из общего количества выпущенных
    totalSupply = totalSupply.sub(_value);
  }



  /**
  * Function that is called when a user or another contract wants to transfer funds .
  */
  function transfer(address _to, uint _value, bytes _data, string _custom_fallback) checkForTransfer(msg.sender, _to, _value) returns (bool) {

    if (isContract(_to)) {
      _transfer(msg.sender, _to, _value);
      ContractReceiver receiver = ContractReceiver(_to);
      receiver.call.value(0)(bytes4(sha3(_custom_fallback)), msg.sender, _value, _data);
      Transfer(msg.sender, _to, _value, _data);
      return true;
    }
    else {
      return transferToAddress(_to, _value, _data);
    }
  }

  /**
  * Function that is called when a user or another contract wants to transfer funds .
  */
  function transfer(address _to, uint _value, bytes _data) checkForTransfer(msg.sender, _to, _value) returns (bool) {

    if (isContract(_to)) {
      return transferToContract(_to, _value, _data);
    }
    else {
      return transferToAddress(_to, _value, _data);
    }
  }


  /**
  * @dev transfer token for a specified address
  * Standard function transfer similar to ERC20 transfer with no _data .
  * Added due to backwards compatibility reasons .
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) checkForTransfer(msg.sender, _to, _value) returns (bool) {

    //standard function transfer similar to ERC20 transfer with no _data
    //added due to backwards compatibility reasons
    bytes memory empty;
    if (isContract(_to)) {
      return transferToContract(_to, _value, empty);
    }
    else {
      return transferToAddress(_to, _value, empty);
    }
  }

  /**
  * assemble the given address bytecode. If bytecode exists then the _addr is a contract.
  */
  function isContract(address _addr) private returns (bool) {
    uint length;
    assembly {
    //retrieve the size of the code on target address, this needs assembly
    length := extcodesize(_addr)
    }
    return (length > 0);
  }

  /**
  * function that is called when transaction target is an address
  */
  function transferToAddress(address _to, uint _value, bytes _data) private returns (bool) {
    _transfer(msg.sender, _to, _value);
    Transfer(msg.sender, _to, _value, _data);
    return true;
  }

  /**
  * function that is called when transaction target is a contract
  */
  function transferToContract(address _to, uint _value, bytes _data) private returns (bool success) {
    _transfer(msg.sender, _to, _value);
    ContractReceiver receiver = ContractReceiver(_to);
    receiver.tokenFallback(msg.sender, _value, _data);
    Transfer(msg.sender, _to, _value, _data);
    return true;
  }

  function _transfer(address _from, address _to, uint _value) private {
    require(balances[_from] >= _value);
    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    if (currentState != IcoStates.PostIco) {
      //общая сумма переводов от владельца (до завершения) ico не может превышать InitialCoinsFor_VipPlacement
      vipPlacementNotDistributed = vipPlacementNotDistributed.sub(_value);
    }
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

    //непроданные токены сгорают
    totalSupply = totalSupply.sub(freeMoney);

    //выставляем состояние токенов
    setMoney(EMISSION_FOR_SALESTAGE1, EMISSION_FOR_SALESTAGE1, RATE_SALESTAGE1);

    //определяем количество токенов которое можно продать на всех стадиях Sale кроме последней
    remForSalesBeforeStageLast =
    EMISSION_FOR_SALESTAGE1 +
    EMISSION_FOR_SALESTAGE2 +
    EMISSION_FOR_SALESTAGE3 +
    EMISSION_FOR_SALESTAGE4 +
    EMISSION_FOR_SALESTAGE5 +
    EMISSION_FOR_SALESTAGE6 +
    EMISSION_FOR_SALESTAGE7;


    //устанавливаем дату начала последней стадии продаж
    startDateOfSaleStageLast = now.add(DURATION_SALESTAGES);

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
    currentState != IcoStates.SaleStage4
    &&
    currentState != IcoStates.SaleStage5
    &&
    currentState != IcoStates.SaleStage6
    &&
    currentState != IcoStates.SaleStage7) return;

    //если есть возможность сразу переходим в состояние StageLast
    if (gotoSaleStageLast()) {
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
    else if (canGotoState(IcoStates.SaleStage5)) {
      currentState = IcoStates.SaleStage5;
      setMoney(EMISSION_FOR_SALESTAGE5, EMISSION_FOR_SALESTAGE5, RATE_SALESTAGE5);
      StateChanged(IcoStates.SaleStage5);
    }
    else if (canGotoState(IcoStates.SaleStage6)) {
      currentState = IcoStates.SaleStage6;
      setMoney(EMISSION_FOR_SALESTAGE6, EMISSION_FOR_SALESTAGE6, RATE_SALESTAGE6);
      StateChanged(IcoStates.SaleStage6);
    }
    else if (canGotoState(IcoStates.SaleStage7)) {
      currentState = IcoStates.SaleStage7;
      setMoney(EMISSION_FOR_SALESTAGE7, EMISSION_FOR_SALESTAGE7, RATE_SALESTAGE7);
      StateChanged(IcoStates.SaleStage7);
    }
  }

  /**
    * Метод переводящий контракт в состояние SaleStageLast
    */
  function gotoSaleStageLast() private returns (bool) {
    if (!canGotoState(IcoStates.SaleStageLast)) return false;

    //ок переходим на состояние SaleStageLast
    currentState = IcoStates.SaleStageLast;

    //выставляем состояние токенов, с учётом всех остатков
    setMoney(remForSalesBeforeStageLast + EMISSION_FOR_SALESTAGELAST, EMISSION_FOR_SALESTAGELAST, RATE_SALESTAGELAST);


    //устанавливаем дату окончания SaleStageLast
    endDateOfSaleStageLast = now.add(DURATION_SALESTAGELAST);

    StateChanged(IcoStates.SaleStageLast);
    return true;
  }

  /**
    * Метод переводящий контракт в состояние PostIco
    */
  function gotoPostIco() private returns (bool) {
    if (!canGotoState(IcoStates.PostIco)) return false;

    //ок переходим на состояние PostIco
    currentState = IcoStates.PostIco;

    //выставляем дату после которой можно использовать премиальные токены
    startDateOfUseTeamTokens = now + DURATION_NONUSETEAM;

    //уничтожаем свободные токены
    totalSupply = totalSupply.sub(freeMoney);
    setMoney(0, 0, 0);

    StateChanged(IcoStates.PostIco);
    return true;
  }

  /**
  * Function that is called when a user or another contract wants to transfer funds .
  */
  function test_transferWithDataAndCallback(address _to, uint _value, bytes _data, string _custom_fallback) returns (bool) {
    return transfer(_to, _value, _data, _custom_fallback);
  }

  /**
  * Function that is called when a user or another contract wants to transfer funds .
  */
  function test_transferWithData(address _to, uint _value, bytes _data) returns (bool) {
    return transfer(_to, _value, _data);
  }


}
