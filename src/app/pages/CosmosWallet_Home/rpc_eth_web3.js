import { ethers } from "ethers";
import DummyTokenABI from "../../../../abi/dummyToken.abi.json";
import StakingAbi from "../../../../abi/stakingVault.abi.json";
import { ELDER_CHAIN_CONFIG } from "../../../../constants";

function getWeb3Provider() {
    try {
        // Create an HTTP provider using the RPC URL
        return new ethers.JsonRpcProvider(ELDER_CHAIN_CONFIG.eth_rpc);
    } catch (error) {
        console.error('Failed to create Web3 provider:', error);
        return null;
    }
}

export const provider = getWeb3Provider();

export const DUMMY_TOKEN_ADDRESS = import.meta.env.VITE_DUMMY_TOKEN_ADDRESS;
export const DUMMY_TOKEN = new ethers.Contract(
    DUMMY_TOKEN_ADDRESS,
    DummyTokenABI,
    provider
);

export const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
export const STAKING_CONTRACT = new ethers.Contract(
    STAKING_ADDRESS,
    StakingAbi,
    provider
);
