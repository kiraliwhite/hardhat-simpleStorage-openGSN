# Sample smart conract demo with GSN 

This is a sample of using GSN with smart contract.

This is the branch with GSN support.

Running it now is slightly different, since GSN must be active when deploying the contract
(this is no problem in testnet/mainnet, but requires one extra step on local network)

In order to run it run these commands in different window each:

1. Install dependencies:
```
yarn install
```

2. Launch Hardhat node:
```
yarn hardhat node
```

3. Deploy GSN contracts, such as RelayHub, Paymaster and Forwarder, and start a Relay Server:
```
yarn gsn start
```

4. Deploy the SimpleStorage contract:
```
yarn deploy
```

5. Interact with simple storage smart contract
```
yarn call-contract-via-gsn
```

Note: 
The simplePaymaster.sol is not currently utilized in the local hardhat environment. However, if the SimpleStorage.sol needs to be deployed on the testnet or mainnet, the deployment of simplePaymaster.sol will be required in order to cover all the gas transaction fees for simplePaymaster.sol.