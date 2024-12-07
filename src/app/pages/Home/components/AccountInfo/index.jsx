import React, { useEffect } from "react";
import { getElderClient } from "elderjs";
import { ELDER_CHAIN_CONFIG } from "../../constants";

const AccountInfo = ({
    account,
    setAccount,
    elderAddress,
    setElderAddress,
    setElderClient,
}) => {
    useEffect(() => {
        checkAccounts().then(setAccount).catch(console.error);

        if (window.keplr) {
            (async () => {
                const { elderAddress, elderClient } = await getElderClient(
                    ELDER_CHAIN_CONFIG
                );
                setElderAddress(elderAddress);
                setElderClient(elderClient);
            })();
        }
    }, []);

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

    return (
        <>
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
                <button onClick={() => getElderClient(ELDER_CHAIN_CONFIG)}>
                    Request Elder Account
                </button>
            )}
        </>
    );
};

export default AccountInfo;
