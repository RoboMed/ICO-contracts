pragma solidity ^0.4.11;


/*
* Contract that is working with ERC223 tokens
*/

contract ContractReceiver {


  address public sender;
  uint public value;
  bytes public data;

  function tokenFallback(address _from, uint _value, bytes _data){

    sender = _from;
    value = _value;
    data = _data;
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
}
