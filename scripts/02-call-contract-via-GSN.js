const { RelayProvider } = require("@opengsn/provider");
const { networkConfig } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const path = require("path");
const fs = require("fs-extra");

async function main() {
  const chainId = network.config.chainId;
  let forwarderAddress, paymasterAddress, simpleStorage;

  if (network.name == "mumbai" && chainId == 80001) {
    forwarderAddress = networkConfig[chainId]["Forwarder"];
    paymasterAddress = JSON.parse(
      fs.readFileSync("./constants/Paymaster.json", "utf8")
    ).address;
  } else if (chainId == 31337) {
    forwarderAddress = require("../build/gsn/Forwarder").address;
    paymasterAddress = require("../build/gsn/Paymaster").address;
  }
  //合約部署時所使用的forwarder地址
  console.log(`forwarder address is ${forwarderAddress}`);

  //Paymaster 合約是實際為交易付款的合約。出於測試目的gsn start 部署了一個 paymaster，它將接受並支付所有交易。
  console.log(`paymaster address is ${paymasterAddress}`);

  //以下兩種寫法都可以，第一種是使用Web3Providr的方式，抓取hardhat的provider，在前端使用metaMask時，可以把括弧內直接替換成window.ethereum
  const defaultProvider = new ethers.providers.Web3Provider(
    hre.network.provider
  );
  //另一種寫法是使用jsonRpcProvider的方式，呼叫的是hardhat的jsonRpcServer，預設為http://localhost:8545
  //const defaultProvider = new ethers.providers.JsonRpcProvider();

  //讀取我們部署的simpleStorage合約地址
  simpleStorageAddress = JSON.parse(
    fs.readFileSync("./constants/MyContract.json", "utf8")
  ).address;

  //會用let是因為要在後面重新connect，使用不同的provider，先讀取已經部署好的simpleStorage合約
  //沒有寫Signer的原因是，我們不會在這裡發送交易，只是讀取合約的資料，所以不需要Signer
  simpleStorage = await ethers.getContractAt(
    "simpleStorage",
    simpleStorageAddress
  );

  const number = await simpleStorage.retrieve();
  console.log(`old Number is ${number}`);
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");

  /**
   * 設置opengsn的合約後，您需要使用 RelayProvider 來訪問您的合約。這是常規 web3 provider的包裝。所有“view”操作均直接發送，但所有交易均通過 GSN 中繼器發送。
   */

  //宣告建立gsnProvider的config，這個物件內塞入key value
  const config = {
    paymasterAddress: paymasterAddress,
    loggerConfiguration: {
      logLevel: "debug",
      //loggerUrl: "logger.opengsn.org",
    },
    auditorsCount: 0,
  };
  //通過這個config，您的應用程序將通過 GSN 路由請求。 “loggerUrl”是可選的：將其設置為 https://logger.opengsn.org，
  //將使用指定的日誌級別將日誌發送到 opengsn 全局記錄器，以幫助 GSN 支持進行故障排除。

  //宣告一個新的gsnProvider，並且使用上述宣告的defaultProvider(Web3Provider)和config來初始化
  let gsnProvider = await RelayProvider.newProvider({
    provider: defaultProvider,
    config,
  });

  // 或是乾脆把defaultProvider換成，用hardhat ethers的provider，這樣就不用宣告defaultProvider了
  // let gsnProvider = await RelayProvider.newProvider({
  //   provider: ethers.provider,
  //   config,
  // });

  await gsnProvider.init();

  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");

  //呼叫paymaster合約，不傳入signer，只是需要讀取合約內relayHub的地址，這個寫法是hardhat-ethers的寫法
  const paymaster = await ethers.getContractAt(
    "simplePaymaster",
    paymasterAddress
  );

  const relayHubAddress = await paymaster.getRelayHub();
  const relayHubAbiFile = path.resolve(__dirname, "../relayHubABI.abi");
  const relayHubABI = fs.readFileSync(relayHubAbiFile, "utf8");

  //同上，只傳入provider而不是傳入Signer，只是為了查詢合約中paymaster的餘額，這個寫法是ethers的寫法
  const relayHub = new ethers.Contract(
    relayHubAddress,
    relayHubABI,
    defaultProvider
  );

  const paymasterBalance = await relayHub.balanceOf(paymasterAddress);
  console.log(
    `Paymaster's Balacne is ${ethers.utils.formatEther(paymasterBalance)} `
  );

  //直接用此新的provider建立一個新帳號，無宣告let或是const，代表是全域變數，不同於let或const，需要在最外層宣告才能成為全域變數，let或const在區塊內宣告，就只是區域變數。
  newAccountAddress = gsnProvider.newAccount().address;
  console.log(`newAccount address is ${newAccountAddress}`);

  //使用初始化好的gsnProvider，建立成為新的Provider
  const newProviderWithGsn = new ethers.providers.Web3Provider(gsnProvider);

  //使用新的provider連結合約，在使用contract.connect時。可以傳入兩種參數
  //如果傳入 Provider，這將返回一個降級的合約，該合約僅具有read-only訪問權限（即不斷調用constant calls）。
  //如果傳入 Signer。這將返回一個代表該Signer執行的合約。
  //以下是傳入剛剛建立好的newAccountAddress,代表這是一個新帳號,完全沒有任何代幣
  //使用newProviderWithGsn.getSigner抓取這個newAccountAddress(signer)，並且連結到simpleStorage合約
  //意味著這個新帳號的簽名會透過GSN的中繼器來發出。
  simpleStorage = simpleStorage.connect(
    newProviderWithGsn.getSigner(newAccountAddress)
  );

  //可以使用連結後合約內的provider的function來取得餘額
  //const balance = await simpleStorage.provider.getBalance(newAccountAddress);
  //也可以直接使用宣告好的新provider來取得餘額
  const balance = await newProviderWithGsn.getBalance(newAccountAddress);
  console.log(`newAccountAddress's balance is ${balance}`);
  console.log("this newAccount doen't have any token");
  console.log("sign message to send transaction via GSN...");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");

  //發出交易，這個交易會透過GSN的中繼器來發出，呼叫simpleStorage合約的store function，傳入數字1234
  const tx = await simpleStorage.store(1234);
  await tx.wait();

  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  console.log("#---------------------------------------#");
  //輸出，交易成功，合約中的數字已經被改變，且用戶沒有花費任何Gas
  const newNumber = await simpleStorage.retrieve();
  console.log(`newNumber is ${newNumber.toString()}`);

  const balance2 = await newProviderWithGsn.getBalance(newAccountAddress);
  console.log(`newAccountAddress's balance is ${balance2}`);

  const paymasterBalance2 = await relayHub.balanceOf(paymasterAddress);
  console.log(
    `Paymaster's Balacne is ${ethers.utils.formatEther(paymasterBalance2)} `
  );

  const totalGasSpent =
    ethers.utils.formatEther(paymasterBalance) -
    ethers.utils.formatEther(paymasterBalance2);
  console.log(`The total gas paymaster spent was ${totalGasSpent}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
