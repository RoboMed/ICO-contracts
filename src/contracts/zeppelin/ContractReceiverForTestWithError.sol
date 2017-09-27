pragma solidity ^0.4.11;


/*
* Contract that is working with ERC223 tokens
*/

contract ContractReceiverForTestWithError {

  string public functionName;
  address public sender;
  uint public value;
  bytes public data;

  function tokenFallback(address _from, uint _value, bytes _data){
    require(false);
    sender = _from;
    value = _value;
    data = _data;
    functionName = "tokenFallback";

  }
}
