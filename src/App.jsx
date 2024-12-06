import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import DummyToken from "./components/dummyToken";
import Staking from "./components/staking";
import { provider } from "./web3";
import { getElderClient } from "elderjs";

export const elderChainConfig = {
    chainName: "devnet-1",
    rpc: "http://66.179.189.178:26657",
    rest: "http://66.179.189.178:1317",
    rollID: 11,
};

const Balance = ({ account }) => {
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

function App() {
    const [account, setAccount] = useState(null);
    const [elderAddress, setElderAddress] = useState(null);
    var [elderClient, setElderClient] = useState(null);

    const checkAccounts = async () => {
        if (!window.ethereum) {
            return null;
        }
        const [account] = await window.ethereum.request({
            method: "eth_accounts",
        });
        window.ethereum.on("accountsChanged", accounts => {
            setAccount(accounts[0]);
        });
        return account;
    };

    const requestAccounts = async () => {
        if (!window.ethereum) {
            return null;
        }
        const [account] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return account;
    };

    useEffect(() => {
        checkAccounts().then(setAccount).catch(console.error);

        if (window.keplr) {
            (async () => {
                const { elderAddress, elderClient } = await getElderClient(
                    elderChainConfig
                );
                setElderAddress(elderAddress);
                setElderClient(elderClient);
            })();
        }
    }, []);

    return (
        <div>
            <h1>dApp with React</h1>
            {account ? (
                <p>
                    Account:{" "}
                    <code style={{ display: "inline" }}>{account}</code>
                </p>
            ) : (
                <button onClick={() => requestAccounts()}>
                    Request Accounts
                </button>
            )}
            {elderAddress ? (
                <p>
                    Elder Account:{" "}
                    <code style={{ display: "inline" }}>{elderAddress}</code>
                </p>
            ) : (
                <button onClick={() => getElderClient(elderChainConfig)}>
                    Request Elder Account
                </button>
            )}
            {provider && account && (
                <>
                    <Balance account={account} />
                    <DummyToken account={account} />
                    <Staking
                        account={account}
                        elderAddress={elderAddress}
                        elderClient={elderClient}
                    />
                </>
            )}
        </div>
    );
}

export default App;
