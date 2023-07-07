# Sample smart conract demo with GSN 

This is a sample of using GSN with smart contract.

This is the branch with GSN support.

Running it now is slightly different, since GSN must be active when deploying the contract
(this is no problem in testnet/mainnet, but requires one extra step on local network)

Install dependencies:
```
yarn install
```

## If you want to run GSN on a local Hardhat blockchain and deploy the simpleStorage contract on the local to achieve gasless transactions using GSN, please follow these steps:

1. Launch Hardhat node (First window, make sure it running):
```
yarn hardhat node
```

2. Deploy GSN contracts, such as RelayHub, Paymaster and Forwarder, and start a Relay Server (Second window, make sure it running)
```
yarn gsn start
```

4. Deploy the simpleStorage contract (Third window):
```
yarn localhost-deploy-MyContract
```

5. Interact with simpleStorage contract using GSN
```
yarn localhost-call-MyContract
```

## If you want to run GSN on the testnet (Polygon Mumbai) and deploy the simpleStorage and Paymaster contract on the testnet to achieve gasless transactions using GSN, please follow these steps:

1. Deploy the Paymaster contract (This contract is used to pay for the gas fees of all users interacting with the simpleStorage contract.)
```
yarn testnet-deploy-Paymaster
```

2. Deploy the simpleStorage contract
```
yarn testnet-deploy-MyContract
```

3. Interact with simpleStorage contract using GSN
```
yarn testnet-call-MyContract
```



