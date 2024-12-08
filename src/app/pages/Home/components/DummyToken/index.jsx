import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
    DUMMY_TOKEN,
    DUMMY_TOKEN_ADDRESS,
    provider,
} from "../../../../../web3";
import { MdOutlineToken } from "react-icons/md";

const getBalanceAndClaimed = async account => {
    const dummyToken = DUMMY_TOKEN.connect(provider);
    const [balance, claimed] = await Promise.all([
        dummyToken.balanceOf(account),
        dummyToken.hasClaimed(account),
    ]);
    return [ethers.utils.formatEther(balance), claimed];
};

const addDummyTokenToMetaMask = async () => {
    if (!window.ethereum) {
        return false;
    }
    try {
        await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20",
                options: {
                    address: DUMMY_TOKEN_ADDRESS,
                    symbol: "DT",
                    decimals: 18,
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
};

const DummyToken = ({ account }) => {
    const [balance, setBalance] = useState("");
    const [claimed, setClaimed] = useState(false);

    const claim = async () => {
        const signer = provider.getSigner();
        const dummyToken = DUMMY_TOKEN.connect(signer);
        const tx = await dummyToken.claim();
        const receipt = await tx.wait();
        console.log(receipt);

        getBalanceAndClaimed(account, provider)
            .then(([balance, claimed]) => {
                setBalance(balance);
                setClaimed(claimed);
            })
            .catch(console.error);
    };

    useEffect(() => {
        getBalanceAndClaimed(account, provider)
            .then(([balance, claimed]) => {
                setBalance(balance);
                setClaimed(claimed);
            })
            .catch(console.error);
    }, [provider, account]);

    if (!balance) {
        return (
            <div className="card">
                <div className="cardHeading">Dummy Token</div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="card flexContainer alignCenter m-t-10">
            <div className="flexContainer m-r-50">
                <MdOutlineToken size={60} />
            </div>
            <div className="flexContainer flexDirectionColumn">
                <div className="cardHeading">Dummy Token</div>
                <p>
                    <strong>Token Balance</strong>
                    <span className="colorGreenLight amountFont m-l-5">
                        {balance} DT
                    </span>
                </p>
                <div className="flexContainer gap-15 m-t-15">
                    {claimed ? (
                        <p>You have already claimed your DT</p>
                    ) : (
                        <button
                            className="btn btn-small btn-outline"
                            onClick={claim}
                        >
                            Claim DT
                        </button>
                    )}
                    <button
                        className="btn btn-big btn-primary"
                        onClick={addDummyTokenToMetaMask}
                    >
                        Add to MetaMask
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DummyToken;
