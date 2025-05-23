import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { provider } from "../../wallet_eth_web3";
import { MdAccountBalance } from "react-icons/md";
import { formatNumber } from "../../../../../utils/helper";
import "./styles.css";

export const Balance = ({ account }) => {
    const [balance, setBalance] = useState("");

    useEffect(() => {
        const getBalance = async () => {
            const balance = await provider.getBalance(account);
            return ethers.formatEther(balance);
        };
        if (!account) {
            return;
        }
        getBalance().then(setBalance).catch(console.error);
    }, [account, provider]);

    if (!balance) {
        return <p>Loading...</p>;
    }
    return (
        <div className="cardWithNoBorder flexContainer flexDirectionColumn flexGrowOne">
            <div className="balanceText flexContainer align-center gap-10 m-t-10 m-b-5">
                <MdAccountBalance size={24} color="#ddd" />
                Your Rollup Balance
            </div>
            <div className="horizontalDivider"></div>
            <div className="colorGreenLight amountFont">
                {formatNumber(balance, 2)} $BONE
            </div>
        </div>
    );
};
