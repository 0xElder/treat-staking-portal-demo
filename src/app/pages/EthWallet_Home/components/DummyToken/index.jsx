import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
    DUMMY_TOKEN,
    DUMMY_TOKEN_ADDRESS,
    provider,
} from "../../wallet_eth_web3";
import { eth_getElderMsgAndFeeTxRaw, eth_broadcastTx } from "elderjs/";

import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
// import { MdOutlineToken } from "react-icons/md";
import "./styles.css";
import shibLogo from "./shiba-inu-shib-logo.png";
import { toast } from 'react-toastify';

const getBalanceAndClaimed = async account => {
    const dummyToken = DUMMY_TOKEN.connect(provider);
    const [balance, claimed] = await Promise.all([
        dummyToken.balanceOf(account),
        dummyToken.hasClaimed(account),
    ]);
    return [ethers.formatEther(balance), claimed];
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
                    symbol: "TREAT",
                    decimals: 18,
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
};

const DummyToken = ({
    account, elderAddress, elderPublicKey
}) => {
    const [balance, setBalance] = useState("");
    const [claimed, setClaimed] = useState(false);

    const claim = async () => {
        const signer = provider.getSigner();
        const dummyToken = DUMMY_TOKEN.connect(signer);
        const tx = await dummyToken.claim.populateTransaction();

        let { tx_hash, rawTx } = await eth_getElderMsgAndFeeTxRaw(tx, elderAddress, elderPublicKey, 1000000, ethers.parseEther("0"), ELDER_CHAIN_CONFIG);
        let broadcastResult = await eth_broadcastTx(rawTx, ELDER_CHAIN_CONFIG.rpc);
        console.log("broadcastResult", broadcastResult);

        if (broadcastResult.code !== 0) {
            toast.error(`Claim Treat Transaction failed`);
            return;
        }
        
        toast.success(`Claim Treat Transaction Hash: ${tx_hash}`);

        // const receipt = await tx.wait();
        // console.log(receipt);

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
        <div className="card flexContainer flexDirectionColumn alignCenter m-t-10">
            <div className="flexContainer flexDirectionColumn flexGrow">
                <img src={shibLogo} alt="Shib Logo" className="shibLogo" />
                <p className="textCenter textSize30 m-t-15">
                    <strong>TOKEN BALANCE</strong> <br />
                    <span className="colorGreenLight amountFont m-l-5">
                        {balance} $TREAT
                    </span>
                </p>
            </div>
            <div className="buttonContainer flexContainer gap-15">
                {claimed ? (
                    <button
                        className="btn btn-claim btn-sparkle btn-primary"
                        onClick={claim}
                        disabled
                    >
                        Already Claimed!
                    </button>
                ) : (
                    <button
                        className="btn btn-claim btn-sparkle btn-primary"
                        onClick={claim}
                    >
                        Claim $TREAT
                    </button>
                )}
                <button
                    className="btn btn-big btn-outline"
                    onClick={addDummyTokenToMetaMask}
                >
                    Add to MetaMask
                </button>
            </div>
        </div>
    );
};

export default DummyToken;
