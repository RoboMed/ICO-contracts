pragma solidity ^0.4.11;


import "./zeppelin/SafeMath.sol";
import "./zeppelin/ERC20.sol";
import "./zeppelin/ERC223.sol";
import "./zeppelin/ContractReceiver.sol";
import "./RobomedIco.sol";


//is ERC223, ERC20
contract TestSecondRobomedIco {

    using SafeMath for uint256;

    string public name = "Second RobomedToken";

    string public symbol = "RBM";

    /**
    *  Адрес оригинального контракта
    */
    address public originalIco;

    /**
    * Владелец контракта -
    * совместно с _coOwner выполняет выведение eth
    */
    address public owner;


    /**
     * Общее количество купленных токенов
     * */
    uint256 public totalBought = 0;


    /**
     * How many token units a buyer gets per wei
     */
    uint256 public constant rate = 21;


    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
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
        _;
    }

    function TestSecondRobomedIco(address _originalIco, address _owner) public {
        originalIco = _originalIco;
        owner = _owner;
    }

    function getOriginal() private view returns (RobomedIco){
        RobomedIco robomedIco = RobomedIco(originalIco);
        return robomedIco;
    }


    /**
     * Событие покупки токенов
     */
    event Buy(address beneficiary, uint256 boughtTokens, uint256 ethValue);

    /**
    * Function to access name of token .
    */
    function name() public constant returns (string) {
        return name;
    }

    /**
    * Function to access symbol of token .
    */
    function symbol() public constant returns (string) {
        return symbol;
    }

    /**
    * Function to access decimals of token .
    */
    function decimals() public constant returns (uint8) {
        return getOriginal().decimals();
    }


    /**
    * Function to access total supply of tokens .
    */
    function totalSupply() public constant returns (uint256) {
        return getOriginal().totalSupply();
    }

    /**
    * Метод получающий количество начисленных премиальных токенов
    */
    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return getOriginal().balanceOf(_owner);
    }





    /**
    * Перевод эфира на указанный кошелёк
    */
    function withdrawal(address _to, uint256 _value) public onlyOwner {
        require(_to != 0x0 && _value > 0);
        _to.transfer(_value);
    }

    /**
    * Fallback функция - из неё по сути просто происходит вызов покупки токенов для отправителя
     */
    function() public payable {
        buyTokens(msg.sender);
    }

    /**
     * Метод покупки токенов
     */
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        require(msg.value != 0);


        //выполняем перевод-покупку для вызывающего
        uint256 tokens = (msg.value).mul(rate);
        assert(tokens > 0);

        RobomedIco robomedIco = getOriginal();
        robomedIco.transfer(beneficiary, tokens);

        Buy(beneficiary, tokens, msg.value);
    }



    //
    //    /**
    //    * Function that is called when a user or another contract wants to transfer funds .
    //    */
    //    function transfer(address _to, uint _value, bytes _data) checkForTransfer(msg.sender, _to, _value) public returns (bool) {
    //
    //        if (isContract(_to)) {
    //            return transferToContract(_to, _value, _data);
    //        }
    //        else {
    //            return transferToAddress(_to, _value, _data);
    //        }
    //    }
    //
    //
    //    /**
    //    * @dev transfer token for a specified address
    //    * Standard function transfer similar to ERC20 transfer with no _data .
    //    * Added due to backwards compatibility reasons .
    //    * @param _to The address to transfer to.
    //    * @param _value The amount to be transferred.
    //    */
    //    function transfer(address _to, uint _value) checkForTransfer(msg.sender, _to, _value) public returns (bool) {
    //
    //        //standard function transfer similar to ERC20 transfer with no _data
    //        //added due to backwards compatibility reasons
    //        bytes memory empty;
    //        if (isContract(_to)) {
    //            return transferToContract(_to, _value, empty);
    //        }
    //        else {
    //            return transferToAddress(_to, _value, empty);
    //        }
    //    }
    //
    //    /**
    //    * assemble the given address bytecode. If bytecode exists then the _addr is a contract.
    //    */
    //    function isContract(address _addr) private view returns (bool) {
    //        uint length;
    //        assembly {
    //        //retrieve the size of the code on target address, this needs assembly
    //        length := extcodesize(_addr)
    //        }
    //        return (length > 0);
    //    }
    //
    //    /**
    //    * function that is called when transaction target is an address
    //    */
    //    function transferToAddress(address _to, uint _value, bytes _data) private returns (bool) {
    //        _transfer(msg.sender, _to, _value);
    //        Transfer(msg.sender, _to, _value, _data);
    //        return true;
    //    }
    //
    //    /**
    //    * function that is called when transaction target is a contract
    //    */
    //    function transferToContract(address _to, uint _value, bytes _data) private returns (bool success) {
    //        _transfer(msg.sender, _to, _value);
    //        ContractReceiver receiver = ContractReceiver(_to);
    //        receiver.tokenFallback(msg.sender, _value, _data);
    //        Transfer(msg.sender, _to, _value, _data);
    //        return true;
    //    }
    //
    //    function _transfer(address _from, address _to, uint _value) private {
    //        require(balances[_from] >= _value);
    //        balances[_from] = balances[_from].sub(_value);
    //        balances[_to] = balances[_to].add(_value);
    //        if (currentState != IcoStates.PostIco) {
    //            //общая сумма переводов от владельца (до завершения) ico не может превышать InitialCoinsFor_VipPlacement
    //            vipPlacementNotDistributed = vipPlacementNotDistributed.sub(_value);
    //        }
    //    }
    //
    //
    //
    //
    //    /**
    //    * @dev Gets the balance of the specified address.
    //    * @param _owner The address to query the the balance of.
    //    * @return An uint256 representing the amount owned by the passed address.
    //    */
    //    function balanceOf(address _owner) public constant returns (uint256 balance) {
    //        return balances[_owner];
    //    }
    //
    //    /**
    //     * @dev Transfer tokens from one address to another
    //     * @param _from address The address which you want to send tokens from
    //     * @param _to address The address which you want to transfer to
    //     * @param _value uint256 the amout of tokens to be transfered
    //     */
    //    function transferFrom(address _from, address _to, uint256 _value) public afterIco returns (bool) {
    //
    //        var _allowance = allowed[_from][msg.sender];
    //
    //        // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    //        // require (_value <= _allowance);
    //
    //        balances[_to] = balances[_to].add(_value);
    //        balances[_from] = balances[_from].sub(_value);
    //        allowed[_from][msg.sender] = _allowance.sub(_value);
    //        Transfer(_from, _to, _value);
    //        return true;
    //    }
    //
    //    /**
    //     * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
    //     * @param _spender The address which will spend the funds.
    //     * @param _value The amount of tokens to be spent.
    //     */
    //    function approve(address _spender, uint256 _value) public afterIco returns (bool) {
    //        // To change the approve amount you first have to reduce the addresses`
    //        //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //        //  already 0 to mitigate the race condition described here:
    //        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    //        require((_value == 0) || (allowed[msg.sender][_spender] == 0));
    //
    //        allowed[msg.sender][_spender] = _value;
    //        Approval(msg.sender, _spender, _value);
    //        return true;
    //    }
    //
    //    /**
    //     * @dev Function to check the amount of tokens that an owner allowed to a spender.
    //     * @param _owner address The address which owns the funds.
    //     * @param _spender address The address which will spend the funds.
    //     * @return A uint256 specifing the amount of tokens still available for the spender.
    //     */
    //    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    //        return allowed[_owner][_spender];
    //    }
    //
    //    /**
    //    * Вспомогательный метод выставляющий количество свободных токенов, рейт и добавляющий количество эмитированных
    //    */
    //    function setMoney(uint256 _freeMoney, uint256 _emission, uint256 _rate) private {
    //        freeMoney = _freeMoney;
    //        totalSupply = totalSupply.add(_emission);
    //        rate = _rate;
    //    }
    //
    //    /**
    //     * Метод переводящий контракт в состояние PreSale
    //     */
    //    function gotoPreSale() private returns (bool) {
    //
    //        //проверяем возможность перехода
    //        if (!canGotoState(IcoStates.PreSale)) return false;
    //
    //        //да нужно переходить
    //
    //        //переходим в PreSale
    //        currentState = IcoStates.PreSale;
    //
    //
    //        //выставляем состояние токенов
    //        setMoney(EMISSION_FOR_PRESALE, EMISSION_FOR_PRESALE, RATE_PRESALE);
    //
    //        //устанавливаем дату окончания PreSale
    //        endDateOfPreSale = now.add(DURATION_PRESALE);
    //
    //        //разим событие изменения состояния
    //        StateChanged(IcoStates.PreSale);
    //        return true;
    //    }
    //
    //    /**
    //    * Метод переводящий контракт в состояние SaleStage1
    //    */
    //    function gotoSaleStage1() private returns (bool) {
    //        //проверяем возможность перехода
    //        if (!canGotoState(IcoStates.SaleStage1)) return false;
    //
    //        //да нужно переходить
    //
    //        //переходим в SaleStage1
    //        currentState = IcoStates.SaleStage1;
    //
    //        //непроданные токены сгорают
    //        totalSupply = totalSupply.sub(freeMoney);
    //
    //        //выставляем состояние токенов
    //        setMoney(EMISSION_FOR_SALESTAGE1, EMISSION_FOR_SALESTAGE1, RATE_SALESTAGE1);
    //
    //        //определяем количество токенов которое можно продать на всех стадиях Sale кроме последней
    //        remForSalesBeforeStageLast =
    //        EMISSION_FOR_SALESTAGE1 +
    //        EMISSION_FOR_SALESTAGE2 +
    //        EMISSION_FOR_SALESTAGE3 +
    //        EMISSION_FOR_SALESTAGE4 +
    //        EMISSION_FOR_SALESTAGE5 +
    //        EMISSION_FOR_SALESTAGE6 +
    //        EMISSION_FOR_SALESTAGE7;
    //
    //
    //        //устанавливаем дату начала последней стадии продаж
    //        startDateOfSaleStageLast = now.add(DURATION_SALESTAGES);
    //
    //        //разим событие изменения состояния
    //        StateChanged(IcoStates.SaleStage1);
    //        return true;
    //    }
    //
    //    /**
    //     * Метод выполняющий переход между состояниями Sale
    //     */
    //    function transitionBetweenSaleStages() private {
    //        //переход между состояниями SaleStages возможен только если находимся в одном из них, кроме последнего
    //        if (
    //        currentState != IcoStates.SaleStage1
    //        &&
    //        currentState != IcoStates.SaleStage2
    //        &&
    //        currentState != IcoStates.SaleStage3
    //        &&
    //        currentState != IcoStates.SaleStage4
    //        &&
    //        currentState != IcoStates.SaleStage5
    //        &&
    //        currentState != IcoStates.SaleStage6
    //        &&
    //        currentState != IcoStates.SaleStage7) return;
    //
    //        //если есть возможность сразу переходим в состояние StageLast
    //        if (gotoSaleStageLast()) {
    //            return;
    //        }
    //
    //        //смотрим в какое состояние можем перейти и выполняем переход
    //        if (canGotoState(IcoStates.SaleStage2)) {
    //            currentState = IcoStates.SaleStage2;
    //            setMoney(EMISSION_FOR_SALESTAGE2, EMISSION_FOR_SALESTAGE2, RATE_SALESTAGE2);
    //            StateChanged(IcoStates.SaleStage2);
    //        }
    //        else if (canGotoState(IcoStates.SaleStage3)) {
    //            currentState = IcoStates.SaleStage3;
    //            setMoney(EMISSION_FOR_SALESTAGE3, EMISSION_FOR_SALESTAGE3, RATE_SALESTAGE3);
    //            StateChanged(IcoStates.SaleStage3);
    //        }
    //        else if (canGotoState(IcoStates.SaleStage4)) {
    //            currentState = IcoStates.SaleStage4;
    //            setMoney(EMISSION_FOR_SALESTAGE4, EMISSION_FOR_SALESTAGE4, RATE_SALESTAGE4);
    //            StateChanged(IcoStates.SaleStage4);
    //        }
    //        else if (canGotoState(IcoStates.SaleStage5)) {
    //            currentState = IcoStates.SaleStage5;
    //            setMoney(EMISSION_FOR_SALESTAGE5, EMISSION_FOR_SALESTAGE5, RATE_SALESTAGE5);
    //            StateChanged(IcoStates.SaleStage5);
    //        }
    //        else if (canGotoState(IcoStates.SaleStage6)) {
    //            currentState = IcoStates.SaleStage6;
    //            setMoney(EMISSION_FOR_SALESTAGE6, EMISSION_FOR_SALESTAGE6, RATE_SALESTAGE6);
    //            StateChanged(IcoStates.SaleStage6);
    //        }
    //        else if (canGotoState(IcoStates.SaleStage7)) {
    //            currentState = IcoStates.SaleStage7;
    //            setMoney(EMISSION_FOR_SALESTAGE7, EMISSION_FOR_SALESTAGE7, RATE_SALESTAGE7);
    //            StateChanged(IcoStates.SaleStage7);
    //        }
    //    }
    //
    //    /**
    //      * Метод переводящий контракт в состояние SaleStageLast
    //      */
    //    function gotoSaleStageLast() private returns (bool) {
    //        if (!canGotoState(IcoStates.SaleStageLast)) return false;
    //
    //        //ок переходим на состояние SaleStageLast
    //        currentState = IcoStates.SaleStageLast;
    //
    //        //выставляем состояние токенов, с учётом всех остатков
    //        setMoney(remForSalesBeforeStageLast + EMISSION_FOR_SALESTAGELAST, EMISSION_FOR_SALESTAGELAST, RATE_SALESTAGELAST);
    //
    //
    //        //устанавливаем дату окончания SaleStageLast
    //        endDateOfSaleStageLast = now.add(DURATION_SALESTAGELAST);
    //
    //        StateChanged(IcoStates.SaleStageLast);
    //        return true;
    //    }
    //
    //
    //
    //    /**
    //      * Метод переводящий контракт в состояние PostIco
    //      */
    //    function gotoPostIco() private returns (bool) {
    //        if (!canGotoState(IcoStates.PostIco)) return false;
    //
    //        //ок переходим на состояние PostIco
    //        currentState = IcoStates.PostIco;
    //
    //        //выставляем дату после которой можно использовать премиальные токены
    //        startDateOfUseTeamTokens = now + DURATION_NONUSETEAM;
    //
    //        //выставляем дату после которой можно зачислять оставшиеся (не распроданные) токены, на произвольный кошелёк
    //        startDateOfRestoreUnsoldTokens = now + DURATION_BEFORE_RESTORE_UNSOLD;
    //
    //        //запоминаем количество нераспроданных токенов
    //        unsoldTokens = freeMoney;
    //
    //        //уничтожаем свободные токены
    //        totalSupply = totalSupply.sub(freeMoney);
    //        setMoney(0, 0, 0);
    //
    //        StateChanged(IcoStates.PostIco);
    //        return true;
    //    }


}
