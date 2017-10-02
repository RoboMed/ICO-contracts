pragma solidity ^0.4.11;


import "./RobomedIco.sol";


contract TestRobomedIco is RobomedIco {

  function TestRobomedIco(address _owner, address _coOwner, address _bountyTokensAccount, address _teamTokensAccount) RobomedIco(_owner, _coOwner, _bountyTokensAccount, _teamTokensAccount){ }

  /**
  * Function that is called when a user or another contract wants to transfer funds .
  */
  function test_transferWithData(address _to, uint _value, bytes _data) returns (bool) {
    return transfer(_to, _value, _data);
  }

}
