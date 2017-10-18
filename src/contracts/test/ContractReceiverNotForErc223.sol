pragma solidity ^0.4.11;


/*
* Contract that is not working with ERC223 tokens
*/

contract ContractReceiverNotForErc223 {

  function foo() public returns (bool) {
    return true;
  }
}
