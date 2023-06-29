const { RelayProvider, ether } = require("@opengsn/provider");

const hre = require("hardhat");

async function main() {
  const forwarder = require("../build/gsn/Forwarder").address;
  const paymaster = require("../build/gsn/Paymaster").address;

  //合約部署時所使用的forwarder地址
  console.log(`forwarder address is ${forwarder}`);

  //Paymaster 合約是實際為交易付款的合約。出於測試目的gsn start 部署了一個 paymaster，它將接受並支付所有交易。
  console.log(`paymaster address is ${paymaster}`);

  //以下兩種寫法都可以，第一種是使用Web3Providr的方式，抓取hardhat的provider，在前端使用metaMask時，可以把括弧內直接替換成window.ethereum
  const defaultProvider = new ethers.providers.Web3Provider(
    hre.network.provider
  );
  //以下的另一種寫法是使用jsonRpcProvider的方式，呼叫的是hardhat的jsonRpcServer，預設為http://localhost:8545
  //const defaultProvider = new ethers.providers.JsonRpcProvider();

  //會用let是因為要在後面重新connect，使用不同的provider
  let simpleStorage = await ethers.getContractAt(
    "SimpleStorage",
    "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c"
  );

  const number = await simpleStorage.retrieve();
  console.log(`old Number is ${number}`);
  console.log("#---------------------------------------#");

  /**
   * 設置opengsn的合約後，您需要使用 RelayProvider 來訪問您的合約。這是常規 web3 provider的包裝。所有“view”操作均直接發送，但所有交易均通過 GSN 中繼器發送。
   */

  //宣告建立gsnProvider的config
  const config = {
    paymasterAddress: paymaster,
    loggerConfiguration: {
      logLevel: "debug",
      //loggerUrl: "logger.opengsn.org",
    },
    auditorsCount: 0,
  };
  //通過這個config，您的應用程序將通過 GSN 路由請求。 “loggerUrl”是可選的：將其設置為 https://logger.opengsn.org，將使用指定的日誌級別將日誌發送到 opengsn 全局記錄器，以幫助 GSN 支持進行故障排除。

  //宣告一個新的gsnProvider，並且使用上述宣告的web3provider和config來初始化
  let gsnProvider = await RelayProvider.newProvider({
    provider: defaultProvider,
    config,
  });

  await gsnProvider.init();

  //直接用此新的provider建立一個新帳號，無宣告let或是const，代表是全域變數，不同於let或const，需要在最外層宣告才能成為全域變數，let或const在區塊內宣告，就只是區域變數。
  from = gsnProvider.newAccount().address;
  console.log(`from address is ${from}`);

  //使用初始化好的gsnProvider，建立成為新的Provider
  const newProviderWithGsn = new ethers.providers.Web3Provider(gsnProvider);

  //使用新的provider連結合約，在使用contract.connect時。可以傳入兩種參數
  //如果傳入 Provider，這將返回一個降級的合約，該合約僅具有read-only訪問權限（即不斷調用constant calls）。
  //如果傳入 Signer。這將返回一個代表該Signer行事的合約。
  //以下是傳入Signer，且這個Signer是從newProviderWithGsn取得的，意味著這個用戶的簽名會透過GSN的中繼器來發出。
  simpleStorage = simpleStorage.connect(newProviderWithGsn.getSigner(from));

  //可以使用連結後合約內的provider的function來取得餘額
  //const balance = await simpleStorage.provider.getBalance(from);
  //也可以直接使用宣告好的新provider來取得餘額
  const balance = await newProviderWithGsn.getBalance(from);
  console.log(`fromAddress balance is ${balance}`);

  //發出交易，這個交易會透過GSN的中繼器來發出
  const tx = await simpleStorage.store(10);
  await tx.wait();

  console.log("#---------------------------------------#");
  //輸出
  const newNumber = await simpleStorage.retrieve();
  console.log(`newNumber is ${newNumber.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
