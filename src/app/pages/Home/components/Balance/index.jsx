import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { provider } from "../../../../../web3";

export const Balance = ({ account }) => {
    const [balance, setBalance] = useState("");

    useEffect(() => {
        const getBalance = async () => {
            const balance = await provider.getBalance(account);
            return ethers.utils.formatEther(balance);
        };
        getBalance().then(setBalance).catch(console.error);
    }, [account, provider]);

    if (!balance) {
        return <p>Loading...</p>;
    }
    return <p>Balance: {balance} tBNB</p>;
};
