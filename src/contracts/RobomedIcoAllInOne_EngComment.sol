pragma solidity ^0.4.11;




/**
 * @title Math
 * @dev Assorted math operations y
 */
library Math {
  function max64(uint64 a, uint64 b) internal pure returns (uint64) {
    return a >= b ? a : b;
  }

  function min64(uint64 a, uint64 b) internal pure returns (uint64) {
    return a < b ? a : b;
  }

  function max256(uint256 a, uint256 b) internal pure returns (uint256) {
    return a >= b ? a : b;
  }

  function min256(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}




/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}




/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  uint256 public totalSupply;

  function balanceOf(address who) constant public returns (uint256);

  function transfer(address to, uint256 value) public returns (bool);

  event Transfer(address indexed from, address indexed to, uint256 value);
}





/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) constant public returns (uint256);

  function transferFrom(address from, address to, uint256 value) public returns (bool);

  function approve(address spender, uint256 value) public returns (bool);

  event Approval(address indexed owner, address indexed spender, uint256 value);
}





contract ERC223 {
  uint public totalSupply;
  function balanceOf(address who) constant public returns (uint);

  function name() constant public returns (string _name);
  function symbol() constant public returns (string _symbol);
  function decimals() constant public returns (uint8 _decimals);
  function totalSupply() constant public returns (uint256 _supply);

  function transfer(address to, uint value) public returns (bool ok);
  function transfer(address to, uint value, bytes data) public returns (bool ok);
  event Transfer(address indexed from, address indexed to, uint value, bytes indexed data);
}





/*
* Contract that is working with ERC223 tokens
*/

contract ContractReceiver {

  string public functionName;
  address public sender;
  uint public value;
  bytes public data;

  function tokenFallback(address _from, uint _value, bytes _data) public {

    sender = _from;
    value = _value;
    data = _data;
    functionName = "tokenFallback";
    //uint32 u = uint32(_data[3]) + (uint32(_data[2]) << 8) + (uint32(_data[1]) << 16) + (uint32(_data[0]) << 24);
    //tkn.sig = bytes4(u);

    /* tkn variable is analogue of msg variable of Ether transaction
    *  tkn.sender is person who initiated this token transaction   (analogue of msg.sender)
    *  tkn.value the number of tokens that were sent   (analogue of msg.value)
    *  tkn.data is data of token transaction   (analogue of msg.data)
    *  tkn.sig is 4 bytes signature of function
    *  if data of token transaction is a function execution
    */
  }

  function customFallback(address _from, uint _value, bytes _data) public {
    tokenFallback(_from, _value, _data);
    functionName = "customFallback";
  }
}







contract RobomedIco is ERC223, ERC20 {

    using SafeMath for uint256;

    string public name = "RobomedToken";

    string public symbol = "RBM";

    uint8 public decimals = 18;

    //addresses

    /*
     * ADDR_OWNER - RBM transition manager
     */
    address public constant ADDR_OWNER = 0x21F6C4D926B705aD244Ec33271559dA8c562400F;

    /*
    * ADDR_WITHDRAWAL1, ADDR_WITHDRAWAL2 - addresses for multisig ETH WITHDRWAWAL
    */
    address public constant ADDR_WITHDRAWAL1 = 0x0dD97e6259a7de196461B36B028456a97e3268bE;

    /*
    * ADDR_WITHDRAWAL1, ADDR_WITHDRAWAL2 -addresses for multisig ETH WITHDRWAWALo
    */
    address public constant ADDR_WITHDRAWAL2 = 0x8c5B02144F7664D37FDfd4a2f90148d08A04838D;

    /**
    *address for Bounty tokens
    */
    address public constant ADDR_BOUNTY_TOKENS_ACCOUNT = 0x6542393623Db0D7F27fDEd83e6feDBD767BfF9b4;

    /**
    *Adress for Team Tokens
    */
    address public constant ADDR_TEAM_TOKENS_ACCOUNT = 0x28c6bCAB2204CEd29677fEE6607E872E3c40d783;



    //VipPlacement constants


    /**
     * VipPlacementToken Num
    */
    uint256 public constant INITIAL_COINS_FOR_VIPPLACEMENT =507937500 * 10 ** 18;

    /**
     * VipPlaceMent Only Stage Duration
    */
    uint256 public constant DURATION_VIPPLACEMENT = 1 seconds;// 1 minutes;//  1 days;

    //end VipPlacement constants

    //PreSale constants

    /**
     * Presale Tokens Num
    */
    uint256 public constant EMISSION_FOR_PRESALE = 76212500 * 10 ** 18;

    /**
     * PreSale Stage Duration
    */
    uint256 public constant DURATION_PRESALE = 1 days;//2 minutes;//1 days;

    /**
     * Presale Stage Rate RBMs for 1 ETH
    */
    uint256 public constant RATE_PRESALE = 2702;

    //end PreSale constants

    //SaleStage1 constants

    /**
     *All Bonus Stages duration  (before ability to nextStage)
    */
    uint256 public constant DURATION_SALESTAGES = 10 days; //2 minutes;//30 days;

    /**
     * 22% Bonus Stage Rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE1 = 2536;

    /**
     * 22% Bonus Stage token num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE1 = 40835000 * 10 ** 18;

    //end SaleStage1 constants

    //SaleStage2 constants

    /**
     * 19% Bonus Stage Rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE2 = 2473;

    /**
    * 19% Bonus Stage num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE2 = 40835000 * 10 ** 18;

    //end SaleStage2 constants

    //SaleStage3 constants

    /**
     *15% bonus stage rate RBMs for 1 ETH
    */ 
    uint256 public constant RATE_SALESTAGE3 = 2390;

    /**
    * 15% bonus stage tokens num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE3 = 40835000 * 10 ** 18;
    //end SaleStage3 constants

    //SaleStage4 constants

    /**
     *13% Bonus stage rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE4 = 2349;

    /**
    * 13% bonus stage tokens num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE4 = 40835000 * 10 ** 18;

    //end SaleStage4 constants


    //SaleStage5 constants

    /**
     * 10% bonus stage rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE5 = 2286;

    /**
    * 10% bonus tokens num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE5 = 40835000 * 10 ** 18;

    //end SaleStage5 constants



    //SaleStage6 constants

    /**
     * 7% bonus stage rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE6 = 2224;

    /**
    * 7% bonus state token
    */
    uint256 public constant EMISSION_FOR_SALESTAGE6 = 40835000 * 10 ** 18;

    //end SaleStage6 constants


    //SaleStage7 constants

    /**
     * 5% bonus stage rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGE7 = 2182;

    /**
    * 5% bonus stage Tokens num
    */
    uint256 public constant EMISSION_FOR_SALESTAGE7 = 40835000 * 10 ** 18;

    //end SaleStage7 constants


    //SaleStageLast constants

    /**
     * NoBonus ICO Duration (before manual activiation)
    */
    uint256 public constant DURATION_SALESTAGELAST = 1 days;// 20 minutes;//10 days;

    /**
     * ICO Stage Rate RBMs for 1 ETH
    */
    uint256 public constant RATE_SALESTAGELAST = 2078;

    /**
    * ICO Stage Tokens num
    */
    uint256 public constant EMISSION_FOR_SALESTAGELAST = 302505000 * 10 ** 18;
    //end SaleStageLast constants

    //PostIco constants

    /**
     * Team Tokens moratory duration
    */
    uint256 public constant DURATION_NONUSETEAM = 180 days;//10 days;

    /**
     * Unsold tokens restore moratory Duration after PostIco
    */
    uint256 public constant DURATION_BEFORE_RESTORE_UNSOLD = 270 days;

    //end PostIco constants

    /**
    * Bounty Tokens Num
    */
    uint256 public constant EMISSION_FOR_BOUNTY = 83750000 * 10 ** 18;

    /**
    * Team Tokens Num
    */
    uint256 public constant EMISSION_FOR_TEAM = 418750000 * 10 ** 18;

    /**
    * Member Team bonus in smart
    */
    uint256 public constant TEAM_MEMBER_VAL = 2000000 * 10 ** 18;

    /**
      * contract stages
      */
    enum IcoStates {

    /**
     *Stage with distribution tokens to  owner address
     owner is able to send this tokens to anybody by  num of  not more then Vipplacement Emission 
     recivers  can't transfer tokens before PostIco Stage
     
     */
    VipPlacement,

    /**
       * Stage during one contract is able to recieve ETH and is sendind RBM to Eth sender according to curreent Raye
       */
    PreSale,

    /**
     * Bonus SubStage of Stages of Bonus ICO Ledger
    */
    SaleStage1,

    /**
     * is like to   SaleStage1
     */
    SaleStage2,

    /**
     * is like to   SaleStage1
     */
    SaleStage3,

    /**
     * is like to   SaleStage1
     */
    SaleStage4,

    /**
     * is like to   SaleStage1
     */
    SaleStage5,

    /**
     * is like to   SaleStage1
     */
    SaleStage6,

    /**
     * is like to   SaleStage1
     */
    SaleStage7,

    /**
     ICO stage.
    */
    SaleStageLast,

    /**
     * After ICO.  ERC 20 / 223 methods are allowed
    */
    PostIco

    }


    /**
    * Token balsnce mapping
    */
    mapping (address => uint256)  balances;

    mapping (address => mapping (address => uint256))  allowed;

    /**
    * Team token balance mapping
    */
    mapping (address => uint256) teamBalances;

    /**
    * owner address public variable
    */
    address public owner;


    /**
    * Multisig  mamber addres varibale
    */
    address public withdrawal1;

    /**
    * Multisig  mamber addres varibale
    */
    address public withdrawal2;




    /**
    * Bounty tokens addres variable
    */
    address public bountyTokensAccount;

    /**
    * team tokens keeper addres tokens variable
    */
    address public teamTokensAccount;

    /**
    *addres for ETH withdrawal by 1st multisig
    */
    address public withdrawalTo;

    /**
    * Sum for withdrawal
    */
    uint256 public withdrawalValue;

    /**
     * Bonty left tokens
     * */
    uint256 public bountyTokensNotDistributed;

    /**
     * team tokens left
     * */
    uint256 public teamTokensNotDistributed;

    /**
      * current State Variable
      */
    IcoStates public currentState;

    /**
    * ETH recieved total
    */
    uint256 public totalBalance;

    /**
    * free tokens sum
    */
    uint256 public freeMoney = 0;

    /**
     * minted tokens sum
     * */
    uint256 public totalSupply = 0;

    /**
     * Bought tokens sum
     * */
    uint256 public totalBought = 0;



    /**
     * Vipplacemnet tokens left
     */
    uint256 public vipPlacementNotDistributed;

    /**
     * Time between deploy and Vipplacemet stages (before manual change state moratory)
     
    */
    uint256 public endDateOfVipPlacement;

    /**
     * Time between PreSale and BonusStagestages (before manual change state moratory)
    */
    uint256 public endDateOfPreSale = 0;

    /**
     * Time between Presale and Bonus stages (before automatic change )
    */
    uint256 public startDateOfSaleStageLast;

    /**
     * Time between  stages (before automatic change )
    */
    uint256 public endDateOfSaleStageLast = 0;


    /**
     * Bonus Tokens left
     */
    uint256 public remForSalesBeforeStageLast = 0;

    /**
    * Var for teem tokens use moratory duration
    */
    uint256 public startDateOfUseTeamTokens = 0;

    /**
    *var for unsold tokens moratory duration
    */
    uint256 public startDateOfRestoreUnsoldTokens = 0;

    /**
    *var for unsold tokens
    */
    uint256 public unsoldTokens = 0;

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
     * @dev Throws if called by any account other than the withdrawal1.
     */
    modifier onlyWithdrawal1() {
        require(msg.sender == withdrawal1);
        _;
    }

    /**
     * @dev Throws if called by any account other than the withdrawal2.
     */
    modifier onlyWithdrawal2() {
        require(msg.sender == withdrawal2);
        _;
    }

    /**
     * @ dev only for PostIco Stage
     */
    modifier afterIco() {
        require(uint(currentState) >= uint(IcoStates.PostIco));
        _;
    }


    /**
    * transfer ops cheker modificator
    */
    modifier checkForTransfer(address _from, address _to, uint256 _value)  {

        //check amount
        require(_value > 0);

        //check reciever
        require(_to != 0x0 && _to != _from);

        //before ICO - only owner! 
        require(currentState == IcoStates.PostIco || _from == owner);

        //to bounty and team - only after ICO
        require(currentState == IcoStates.PostIco || (_to != bountyTokensAccount && _to != teamTokensAccount));

        _;
    }



    /**
     * State (stage) change event
     */
    event StateChanged(IcoStates state);


    /**
     *buying event
     */
    event Buy(address beneficiary, uint256 boughtTokens, uint256 ethValue);

    /**
    * @dev conctructor
    */
    function RobomedIco() public {

        //all adresses are not 0
        //depoyer is not owner
        //all adresses are unique
        require(ADDR_OWNER != 0x0 && ADDR_OWNER != msg.sender);
        require(ADDR_WITHDRAWAL1 != 0x0 && ADDR_WITHDRAWAL1 != msg.sender);
        require(ADDR_WITHDRAWAL2 != 0x0 && ADDR_WITHDRAWAL2 != msg.sender);
        require(ADDR_BOUNTY_TOKENS_ACCOUNT != 0x0 && ADDR_BOUNTY_TOKENS_ACCOUNT != msg.sender);
        require(ADDR_TEAM_TOKENS_ACCOUNT != 0x0 && ADDR_TEAM_TOKENS_ACCOUNT != msg.sender);

        require(ADDR_BOUNTY_TOKENS_ACCOUNT != ADDR_TEAM_TOKENS_ACCOUNT);
        require(ADDR_OWNER != ADDR_TEAM_TOKENS_ACCOUNT);
        require(ADDR_OWNER != ADDR_BOUNTY_TOKENS_ACCOUNT);
        require(ADDR_WITHDRAWAL1 != ADDR_OWNER);
        require(ADDR_WITHDRAWAL1 != ADDR_BOUNTY_TOKENS_ACCOUNT);
        require(ADDR_WITHDRAWAL1 != ADDR_TEAM_TOKENS_ACCOUNT);
        require(ADDR_WITHDRAWAL2 != ADDR_OWNER);
        require(ADDR_WITHDRAWAL2 != ADDR_BOUNTY_TOKENS_ACCOUNT);
        require(ADDR_WITHDRAWAL2 != ADDR_TEAM_TOKENS_ACCOUNT);
        require(ADDR_WITHDRAWAL2 != ADDR_WITHDRAWAL1);

        //adresses mapping
        //test
        owner = ADDR_OWNER;
        withdrawal1 = ADDR_WITHDRAWAL1;
        withdrawal2 = ADDR_WITHDRAWAL2;
        bountyTokensAccount = ADDR_BOUNTY_TOKENS_ACCOUNT;
        teamTokensAccount = ADDR_TEAM_TOKENS_ACCOUNT;

        //initial balances
        balances[owner] = INITIAL_COINS_FOR_VIPPLACEMENT;
        balances[bountyTokensAccount] = EMISSION_FOR_BOUNTY;
        balances[teamTokensAccount] = EMISSION_FOR_TEAM;

        //free tokens
        bountyTokensNotDistributed = EMISSION_FOR_BOUNTY;
        teamTokensNotDistributed = EMISSION_FOR_TEAM;
        vipPlacementNotDistributed = INITIAL_COINS_FOR_VIPPLACEMENT;

        currentState = IcoStates.VipPlacement;
        totalSupply = INITIAL_COINS_FOR_VIPPLACEMENT + EMISSION_FOR_BOUNTY + EMISSION_FOR_TEAM;

        endDateOfVipPlacement = now.add(DURATION_VIPPLACEMENT);
        remForSalesBeforeStageLast = 0;


        //set team for members
        owner = msg.sender;
        //CIO
        transferTeam(0xa19DC4c158169bC45b17594d3F15e4dCb36CC3A3, TEAM_MEMBER_VAL);
        //COO
        transferTeam(0xdf66490Fe9F2ada51967F71d6B5e26A9D77065ED, TEAM_MEMBER_VAL);
        //Dev
        transferTeam(0xf0215C6A553AD8E155Da69B2657BeaBC51d187c5, TEAM_MEMBER_VAL);
        //DEV
        transferTeam(0x6c1666d388302385AE5c62993824967a097F14bC, TEAM_MEMBER_VAL);
        //CTO
        transferTeam(0x82D550dC74f8B70B202aB5b63DAbe75E6F00fb36, TEAM_MEMBER_VAL);
        owner = ADDR_OWNER;
    }

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
        return decimals;
    }


    /**
    * Function to access total supply of tokens .
    */
    function totalSupply() public constant returns (uint256) {
        return totalSupply;
    }

    /**
    * check team balance method
    */
    function teamBalanceOf(address _owner) public constant returns (uint256){
        return teamBalances[_owner];
    }

    /**
    * accrue my team tokens method
    */
    function accrueTeamTokens() public afterIco {
        //only after moratory
        require(startDateOfUseTeamTokens <= now);

        //totalSupply inc
        totalSupply = totalSupply.add(teamBalances[msg.sender]);

        //balance transfer and clear team balance
        balances[msg.sender] = balances[msg.sender].add(teamBalances[msg.sender]);
        teamBalances[msg.sender] = 0;
    }

    /**
    * unsold tokens rectore check
    */
    function canRestoreUnsoldTokens() public constant returns (bool) {
        //after ICO
        if (currentState != IcoStates.PostIco) return false;

        //and after moratory duration
        if (startDateOfRestoreUnsoldTokens > now) return false;

        //unsold tokens left
        if (unsoldTokens == 0) return false;

        return true;
    }

    /**
    * Unsold tokens restoerв
    */
    function restoreUnsoldTokens(address _to) public onlyOwner {
        require(_to != 0x0);
        require(canRestoreUnsoldTokens());

        balances[_to] = balances[_to].add(unsoldTokens);
        totalSupply = totalSupply.add(unsoldTokens);
        unsoldTokens = 0;
    }

    /**
     * next stage switching  method
     * 
    */
    function gotoNextState() public onlyOwner returns (bool)  {

        if (gotoPreSale() || gotoSaleStage1() || gotoSaleStageLast() || gotoPostIco()) {
            return true;
        }
        return false;
    }


    /**
    * 1st multisig eth transfer initial
    */
    function initWithdrawal(address _to, uint256 _value) public afterIco onlyWithdrawal1 {
        withdrawalTo = _to;
        withdrawalValue = _value;
    }

    /**
    * 2nd multisig eth transfer ack
    */
    function approveWithdrawal(address _to, uint256 _value) public afterIco onlyWithdrawal2 {
        require(_to != 0x0 && _value > 0);
        require(_to == withdrawalTo);
        require(_value == withdrawalValue);

        totalBalance = totalBalance.sub(_value);
        withdrawalTo.transfer(_value);

        withdrawalTo = 0x0;
        withdrawalValue = 0;
    }



    /**
     * checking nextstage switching
     */
    function canGotoState(IcoStates toState) public constant returns (bool){
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
            //only after bonus stages
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

            //Bonus tokens are sold
            //or duration is expired
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
    * Fallback for buying
    */
    function() public payable {
        buyTokens(msg.sender);
    }

    /**
     * Buy tokens method
     */
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        require(msg.value != 0);

        //bounty and team adress is not able to buy tokens
        require(beneficiary != bountyTokensAccount && beneficiary != teamTokensAccount);

        //switching before substages by one eth income
        uint256 remVal = msg.value;

        //ETH income inc
        totalBalance = totalBalance.add(msg.value);

        //tokens bought
        uint256 boughtTokens = 0;

        while (remVal > 0) {
            //stage check
            require(
            currentState != IcoStates.VipPlacement
            &&
            currentState != IcoStates.PostIco);

            //buying for sender
            //free money check
            uint256 tokens = remVal.mul(rate);
            if (tokens > freeMoney) {
                remVal = remVal.sub(freeMoney.div(rate));
                tokens = freeMoney;
            }
            else
            {
                remVal = 0;
                //if ens is lower then ETHwei - this is a gift)
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

            //every stage exclude ICO
            if (
            uint(currentState) >= uint(IcoStates.SaleStage1)
            &&
            uint(currentState) <= uint(IcoStates.SaleStage7)) {

                //unsold sum DEC
                remForSalesBeforeStageLast = remForSalesBeforeStageLast.sub(tokens);

                //stages switching
                transitionBetweenSaleStages();
            }

        }

        Buy(beneficiary, boughtTokens, msg.value);

    }

    /**
    * Bounty tokens sending
    */
    function transferBounty(address _to, uint256 _value) public onlyOwner {
        //reciver check
        require(_to != 0x0 && _to != msg.sender);

        //free bounty dec
        bountyTokensNotDistributed = bountyTokensNotDistributed.sub(_value);

        //transfer
        balances[_to] = balances[_to].add(_value);
        balances[bountyTokensAccount] = balances[bountyTokensAccount].sub(_value);

        Transfer(bountyTokensAccount, _to, _value);
    }

    /**
    * team tokens sendig
    */
    function transferTeam(address _to, uint256 _value) public onlyOwner {
        //reciver check
        require(_to != 0x0 && _to != msg.sender);

        //уleft team dec
        teamTokensNotDistributed = teamTokensNotDistributed.sub(_value);

        //transfer
        teamBalances[_to] = teamBalances[_to].add(_value);
        balances[teamTokensAccount] = balances[teamTokensAccount].sub(_value);

        //totalsup dec
        totalSupply = totalSupply.sub(_value);
    }

    /**
    * Function that is called when a user or another contract wants to transfer funds .
    */
    function transfer(address _to, uint _value, bytes _data) checkForTransfer(msg.sender, _to, _value) public returns (bool) {

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
    function transfer(address _to, uint _value) checkForTransfer(msg.sender, _to, _value) public returns (bool) {

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
    function isContract(address _addr) private view returns (bool) {
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
            //subtotal Vipcheck for owner
            vipPlacementNotDistributed = vipPlacementNotDistributed.sub(_value);
        }
    }




    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amout of tokens to be transfered
     */
    function transferFrom(address _from, address _to, uint256 _value) public afterIco returns (bool) {

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
    function approve(address _spender, uint256 _value) public afterIco returns (bool) {
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
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    /**
    * settong free, rate, minting
    */
    function setMoney(uint256 _freeMoney, uint256 _emission, uint256 _rate) private {
        freeMoney = _freeMoney;
        totalSupply = totalSupply.add(_emission);
        rate = _rate;
    }

    /**
     * PreSale stage switching
     */
    function gotoPreSale() private returns (bool) {

        //check ability
        if (!canGotoState(IcoStates.PreSale)) return false;

        //Yes

        // PreSale activiation
        currentState = IcoStates.PreSale;


        //stage vars setting
        setMoney(EMISSION_FOR_PRESALE, EMISSION_FOR_PRESALE, RATE_PRESALE);

        //PreSale stage duration
        endDateOfPreSale = now.add(DURATION_PRESALE);

        //public vars csnc
        StateChanged(IcoStates.PreSale);
        return true;
    }

    /**
    * Bonus stage switching
    */
    function gotoSaleStage1() private returns (bool) {
        //checking ability
        if (!canGotoState(IcoStates.SaleStage1)) return false;

        //Yes

        // Bonus Stage activating
        currentState = IcoStates.SaleStage1;

        //Presale unsold are erased
        totalSupply = totalSupply.sub(freeMoney);

        //stage mapping
        setMoney(EMISSION_FOR_SALESTAGE1, EMISSION_FOR_SALESTAGE1, RATE_SALESTAGE1);

        //sum for all bonuses
        remForSalesBeforeStageLast =
        EMISSION_FOR_SALESTAGE1 +
        EMISSION_FOR_SALESTAGE2 +
        EMISSION_FOR_SALESTAGE3 +
        EMISSION_FOR_SALESTAGE4 +
        EMISSION_FOR_SALESTAGE5 +
        EMISSION_FOR_SALESTAGE6 +
        EMISSION_FOR_SALESTAGE7;


        //Bonus duration 
        startDateOfSaleStageLast = now.add(DURATION_SALESTAGES);

        //Public vars sync
        StateChanged(IcoStates.SaleStage1);
        return true;
    }

    /**
     * Stages switching
     */
    function transitionBetweenSaleStages() private {
        //only in bonus subStage
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

        //if possible - to the ICO
        if (gotoSaleStageLast()) {
            return;
        }

        //resolve next stage and activate
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
      * ICO Stahe activation method
      */
    function gotoSaleStageLast() private returns (bool) {
        if (!canGotoState(IcoStates.SaleStageLast)) return false;

        //ок  - to the ICO
        currentState = IcoStates.SaleStageLast;

        //all tokens with tokens from bonuses left
        setMoney(remForSalesBeforeStageLast + EMISSION_FOR_SALESTAGELAST, EMISSION_FOR_SALESTAGELAST, RATE_SALESTAGELAST);


        //ICO duration (before manual switching)
        endDateOfSaleStageLast = now.add(DURATION_SALESTAGELAST);

        StateChanged(IcoStates.SaleStageLast);
        return true;
    }



    /**
      *PostIco Stage activating
      */
    function gotoPostIco() private returns (bool) {
        if (!canGotoState(IcoStates.PostIco)) return false;

        //ок  - go to PostIco
        currentState = IcoStates.PostIco;

        //team tokens moratory duration
        startDateOfUseTeamTokens = now + DURATION_NONUSETEAM;

        //unsold tokens duration moratory
        startDateOfRestoreUnsoldTokens = now + DURATION_BEFORE_RESTORE_UNSOLD;

        //all unsold
        unsoldTokens = freeMoney;

        //ereasing free
        totalSupply = totalSupply.sub(freeMoney);
        setMoney(0, 0, 0);

        StateChanged(IcoStates.PostIco);
        return true;
    }


}
