// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// 開啟 ABI V2 編碼器
pragma experimental ABIEncoderV2;

import "@opengsn/contracts/src/BasePaymaster.sol";

contract simplePaymaster is BasePaymaster {
  function versionPaymaster()
    external
    view
    virtual
    override
    returns (string memory)
  {
    return "3.0.0-beta.3+opengsn.simple.paymaster";
  }

  //主要的邏輯應該放在 _preRelayedCall 方法中，這個方法決定是否支付交易。GNSType.RelayRequest 類型在此處被定義，它包含多個字段 - 我們將使用 .target 字段，它是目標合約。
  function _preRelayedCall(
    GsnTypes.RelayRequest calldata relayRequest,
    bytes calldata signature,
    //approvalData是由 Web 客戶端通過中繼器relay發送的。它可以包含 DApp 需要的任何數據，以判斷是否批准請求。默認情況下，BasePaymaster 將拒絕帶有apporvalData（或paymasterData）的請求。
    //如果paymaster想要使用它們，應該覆蓋驗證 _verifyApprovalData()。例如，請參考 VerifyingPaymaster。
    bytes calldata approvalData,
    //該參數可以與relayHub.calculateCharge()結合使用，來計算交易將產生的成本。使用它超出了本基本教程的範圍。
    uint256 maxPossibleGas
  )
    internal
    virtual
    override
    returns (
      //此function回傳的上下文context與 postRelayedCall 方法共享。
      //這是一種在 pre- 到 post- 方法之間共享call信息（例如from approval data）的方式，而無需進行昂貴的狀態更改。
      //函數返回的 rejectOnRecipientRevert value 允許paymaster將決策委託給recipient自身。使用此功能超出了本教程的範圍。
      bytes memory context,
      bool rejectOnRecipientRevert
    )
  {
    //這個paymaster很原始，但也不完全是個傻瓜。它只接受，發送到我們的recipient智能合約的請求。這就是 preRelayedCall 返回拒絕的方式
    // - 要么是請求失敗，要么是明確呼叫 revert，或只是耗盡了 Gas。如果我們從該函數中正常返回任何值，則通常意味著paymaster承諾為交易付款，並且即使交易最終失敗也會這樣做。
    //_verifyForwarder(relayRequest);
    //Advanced Paymaster 實現可以選擇覆蓋 IPaymaster 接口的 getGasLimits() 方法。這樣做可以創建一個配置，在該配置中，出納員承諾在消耗一定數量的氣體後支付交易費用。
    //require(relayRequest.request.to == ourTarget, "I pay only for our target");
    //返回值用於從 preRelayedCall（接收整個請求）傳遞“context上下文、脈絡、情境”給 postRelayedCall。對於一個簡單的paymaster，這是不需要的，
    //但是更複雜的支付主機可能會執行一些後置中繼操作。在這個示例中，可以返回空值。
    (relayRequest, signature, approvalData, maxPossibleGas);
    return ("", false);
  }

  //此函數在relayed call之後被調用。此時，請求的成本幾乎已經確定（除了 postRelayedCall 本身的Gas成本），我們可以進行任何需要的計算操作，收費給相關實體等等。
  function _postRelayedCall(
    bytes calldata context,
    bool success,
    //gasUseWithoutPost 参数提供了到目前为止交易使用的燃料量。它包括交易的所有燃料，除了我们将在 postRelayedCall 中使用的未知数量。
    uint256 gasUseWithoutPost,
    GsnTypes.RelayData calldata relayData
  ) internal virtual override {
    //用括弧包起來，代表不處理這些參數。
    (context, success, gasUseWithoutPost, relayData);
  }
}
