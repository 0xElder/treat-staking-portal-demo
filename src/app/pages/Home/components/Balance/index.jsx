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
        <div className="card cardWithNoBorder flexContainer flexDirectionColumn flexGrowOne">
            <div className="balanceText flexContainer align-center gap-10 m-t-10 m-b-5">
                <MdAccountBalance size={24} color="#ddd" />
                Your Balance
            </div>
            <div className="horizontalDivider"></div>
            <div className="colorGreenLight amountFont">{balance} tBNB</div>
        </div>
    );
};
