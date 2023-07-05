/** 此script目的是在測試網的環境下把paymaster合約部署到測試網，若是本地hardhat網路則不需執行 */

const hre = require("hardhat");
const { network } = hre;
const { networkConfig } = require("../helper-hardhat-config");
const { saveInfo } = require("../utils/saveInfo");
const fs = require("fs-extra");
const ethers = hre.ethers;
const path = require("path");

async function main() {
  //從hardhat環境中抽出network變數,如果等於mumbai，就執行以下程式碼
  const chainId = network.config.chainId;
  if (network.name == "mumbai" && chainId == 80001) {
    const deployer = (await ethers.getSigners())[0];
    console.log("Deploying contracts with the account:", deployer.address);
    console.log(`this is ${network.name} network`);

    const forwarderAddress = networkConfig[chainId]["Forwarder"];
    console.log(`forwarder address is ${forwarderAddress}`);
    saveInfo("Forwarder", forwarderAddress);

    const relayHubAddress = networkConfig[chainId]["RelayHub"];
    console.log(`relayHub address is ${relayHubAddress}`);
    saveInfo("RelayHub", relayHubAddress);

    //部署paymaster合約
    console.log("Deploying Paymaster Contract...");
    const simplePaymasterFactory = await hre.ethers.getContractFactory(
      "simplePaymaster"
    );
    const simplePaymaster = await simplePaymasterFactory.deploy();
    await simplePaymaster.deployed();
    console.log(`Paymaster contract address is ${simplePaymaster.address}`);
    //把部署好的paymaster地址寫到constants/Paymaster.json檔案中
    saveInfo("Paymaster", simplePaymaster.address);

    //呼叫paymaster合約的setRelayHub function，將relayHub的address傳入
    const setRelayHubTx = await simplePaymaster.setRelayHub(relayHubAddress);
    await setRelayHubTx.wait();

    //呼叫paymaster合約的setTrustedForwarder function，將forwarder的address傳入
    const setForwarderTx = await simplePaymaster.setTrustedForwarder(
      forwarderAddress
    );
    await setForwarderTx.wait();

    //在console中列出地址，檢查合約中的relayHub和trustedForwarder是否正確
    const RelayHubAddressFromContract = await simplePaymaster.getRelayHub();
    console.log(
      `RelayHub address from paymaster is ${RelayHubAddressFromContract}`
    );

    const trustedForwarderFromContract =
      await simplePaymaster.getTrustedForwarder();
    console.log(
      `trustedForwarder address from paymaster is ${trustedForwarderFromContract}`
    );

    /**
     * 接下來 因為paymaster合約會需要替用戶支付Gas費用，所以需要對paymaster入金(實際上是relayHub)
     * 入金的是代幣是使用區塊鏈原生代幣，例如 mumbai是matic。
     * 要入金的是paymaster的receive function，會自動轉給relayHub。
     * 或是直接呼叫relayHub的depositFor function，原生代幣轉過去。
     * 參考： https://docs.opengsn.org/networks/polygon/mumbai.html
     */

    //錢包中區塊鏈原生代幣的餘額，在mumbai測試網這個單位是matic
    const walletBalance = await ethers.provider.getBalance(deployer.address);
    console.log(
      `deployer's native blockchain token balance is ${ethers.utils.formatEther(
        walletBalance
      )}`
    );

    console.log("transfer some native blockchain token to paymaster...");

    //使用erc20 token transfer，並不會觸發receive function，要使用signer.sendTransaction或是wallet.sendTransaction
    //從deployer轉給paymaster，paymaster的receive function會被觸發
    //參考 https://docs.ethers.org/v5/api/signer/
    //這裡是mumbai所以是發送0.1個matic給paymaster
    const tx = await deployer.sendTransaction({
      to: simplePaymaster.address,
      value: ethers.utils.parseEther("0.1"),
    });

    await tx.wait();

    //發送後，錢包中的native blockchain token餘額會減少
    const walletBalance2 = await ethers.provider.getBalance(deployer.address);
    console.log(
      `deployer's native blockchain token balance is ${ethers.utils.formatEther(
        walletBalance2
      )}`
    );

    /**
     * 可以檢查relayHub是否有paymaster可花費的餘額，可以直接觀察polygonscan上的relayHub合約。
     * https://mumbai.polygonscan.com/address/0x3232f21a6e08312654270c78a773f00dd61d60f5
     * 合約內的balanceOf就是paymaster可花費的餘額
     *
     * 也可以查看是否有Deposit For的交易，例如：
     * https://mumbai.polygonscan.com/tx/0xefbe702f99c392591ca879fa164c11218a7db8afd043e35431523cc25f411752
     *
     * 以下是檢查relayHub中paymaster的餘額
     */

    const relayHubAbiFile = path.resolve(__dirname, "../relayHubABI.abi");
    const relayHubABI = fs.readFileSync(relayHubAbiFile, "utf8");
    //relayHubAddress在開頭已經從設定檔內抓出來了，所以不用宣告。

    /** ethers的寫法  */
    const relayHub = new ethers.Contract(
      relayHubAddress,
      relayHubABI,
      deployer
    );

    //查詢relayHub的paymaster餘額
    const paymasterBalance = await relayHub.balanceOf(simplePaymaster.address);
    console.log(
      `Paymaster's Balacne is ${ethers.utils.formatEther(paymasterBalance)} `
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
