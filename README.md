# Treat-Staking-Portal-Demo

## Table of Contents

- [About](#about)
- [Prerequisites](#prerequisites)
- [Installing](#installing)
- [ElderJS Docs](#elderjs_docs)

## About <a name = "about"></a>

This is a sample dapp created using ElderJS and React. It is a DEMO staking portal for the Treat token. It allows users to stake their Treat tokens and earn rewards. The rewards are distributed in the form of Treat tokens. The dapp also allows users to unstake their tokens and claim their rewards.

### Prerequisites <a name = "prerequisites"></a>

What things you need to install the software and how to install them.

```
npm
nodejs
```

### Installing <a name = "installing"></a>
Deploy Smart Contracts : 
```
- Copy `contracts/DummyToken.sol` and `contracts/StakingVault.sol` to [Remix]("https://remix.ethereum.org/").
- Deploy DummyToken and copy its address.
- Deploy StakingVault and initialise it using the address of DummyToken.
```

Replace `.env` variables :
```
VITE_DUMMY_TOKEN_ADDRESS="<DUMMY_TOKEN_ADDRESS>"
VITE_STAKING_ADDRESS="<STAKING_VAULT_ADDRESS>"
```

Replace `constants.js` variables :
```
export const ELDER_CHAIN_CONFIG = {

    chainName: "devnet-4", # predefined config of devnet-1 for Elder
    rpc: "http://localhost:26657", # rpc/tendermint address for Elder Node (default :26657)
    rest: "http://localhost:1317", # rest address for Elder Node (default :1317)
    rollID: 11, # registered ID of target Rollapp on Elder
    rollChainID: 42069, # chainID of target Rollapp on Elder

    eth_rpc : "http://localhost:8545", # rpc address for Ethereum Node (default :8545)
};
```

Install Dependencies

```
npm i
```

Run portal in dev environment
```
npm run dev
```

### ElderJS Docs <a name = "elderjs_docs"></a>
Find the elderjs docs [here]("https://github.com/0xElder/elderjs") and implement it in your project.
