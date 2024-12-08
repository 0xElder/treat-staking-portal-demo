import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { provider } from "../../../../../web3";
import { MdAccountBalance } from "react-icons/md";
import "./styles.css";

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
    return (
        <div className="card flexContainer flexDirectionColumn flexGrowOne">
            <div>
                <MdAccountBalance size={20} color="#ddd" />
            </div>
            <div className="balanceText">Your Balance</div>
            <div className="horizontalDivider"></div>
            <div className="colorGreenLight balanceAmount">{balance} tBNB</div>
        </div>
    );
};
