// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

//import OPENGSN
import "@opengsn/contracts/src/ERC2771Recipient.sol";

//繼承openGSN
contract SimpleStorage is ERC2771Recipient {
  uint256 favoriteNumber;

  //版本
  string public versionRecipient = "3.0.0-beta.6";

  //設定信任的轉發器
  constructor(address forwarder) {
    _setTrustedForwarder(forwarder);
  }

  function store(uint256 _favoriteNumber) public {
    favoriteNumber = _favoriteNumber;
    (_favoriteNumber);
  }

  function retrieve() public view returns (uint256) {
    return favoriteNumber;
  }

  /*將代碼中以及代碼使用的任何庫中的 msg.sender 替換為 _msgSender()。如果您收到正常的以太坊交易（來自另一個合約或支付其自己的 Gas 費用的外部帳戶），
  則該值與 msg.sender 相同。如果您收到以太坊交易，_msgSender() 會為您提供正確的發件人，而 msg.sender 將是上述設定的轉發器forwarder。
  */
}
