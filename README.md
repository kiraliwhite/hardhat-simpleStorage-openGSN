# Sample smart conract demo with GSN 

This is a sample of using GSN with smart contract.

This is the branch with GSN support.

Running it now is slightly different, since GSN must be active when deploying the contract
(this is no problem in testnet/mainnet, but requires one extra step on local network)

Install dependencies:
```
yarn install
```

### Run GSN on the local Hardhat blockchain and interact simpleStorage contract without Gas.

1. Launch Hardhat node 
>(First window, make sure it running):
```
yarn hardhat node
```

2. Deploy GSN contracts, such as RelayHub, Paymaster and Forwarder, and start a Relay Server 
>(Second window, make sure it running)
```
yarn gsn start
```

4. Deploy the simpleStorage contract 
>(Third window):
```
yarn localhost-deploy-MyContract
```

5. Interact with simpleStorage contract using GSN
```
yarn localhost-call-MyContract
```

### Run GSN on the testnet (polygon mumbai) and interact simpleStorage contract without Gas.

1. Deploy the Paymaster contract 
>(This contract is used to pay for the gas fees of all users interacting with the simpleStorage contract.)
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



