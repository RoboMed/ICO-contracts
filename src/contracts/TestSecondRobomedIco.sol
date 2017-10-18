pragma solidity ^0.4.11;


import "./zeppelin/SafeMath.sol";
import "./zeppelin/ERC20.sol";
import "./zeppelin/ERC223.sol";
import "./zeppelin/ContractReceiver.sol";
import "./RobomedIco.sol";


//is ERC223, ERC20
contract TestSecondRobomedIco {

    using SafeMath for uint256;


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
    * Метод возвращающий количество оставшихся токенов
    */
    function getRemains() public view returns (uint256){
        return getOriginal().balanceOf(this);
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


}
