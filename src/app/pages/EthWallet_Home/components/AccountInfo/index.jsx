import React, { useEffect } from "react";
import { provider } from "../../wallet_eth_web3";
import {  eth_getElderAccountInfoFromSignature } from "elderjs";
import { getMaskedValue } from "../../../../../utils/helper";
import CopyToClipboard from "../../../../components/CopyToClipboard";
import { MdAccountBox, MdFingerprint } from "react-icons/md";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
import "./styles.css";

const AccountInfo = ({
    account,
    setAccount,
    elderAddress,
    setElderAddress,
    setElderPublicKey,
}) => {
    useEffect(() => {
        async function fetchData() {
            if (!window.ethereum) {
                return null;
            }

            var ethAddr;

            try {
                ethAddr = await checkAccounts()
                setAccount(ethAddr)
            } catch (error) {
                console.log(error)
            }
        }
        fetchData();
    }, []);

    const getElderAccountInfo = async () => {
        let message = "Sign to Login";

        const signer = await provider.getSigner();

        const signature = await signer.signMessage(message);

        var { recoveredPublicKey, elderAddr } = await eth_getElderAccountInfoFromSignature(message, signature)

        setElderAddress(elderAddr);
        setElderPublicKey(recoveredPublicKey);
    };

    const checkAccounts = async () => {
        if (!window.ethereum) {
            return null;
        }

        const [account] = await window.ethereum.request({
            method: "eth_requestAccounts",
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

    const renderAccountRow = () => {
        return (
            <div className="accountRow flexContainer alignCenter justifyBetween">
                <div className="accountItem flexContainer alignCenter gap-10">
                    <MdAccountBox size={24} />
                    Account
                </div>
                {account ? (
                    <div className="accountValue flexContainer alignCenter justifyCenter gap-10">
                        {getMaskedValue(account)}
                        <CopyToClipboard textToCopy={account} />
                    </div>
                ) : (
                    renderButton("Request Accounts", requestAccounts)
                )}
            </div>
        );
    };

    const renderElderAccountRow = () => {
        return (
            <div className="accountRow flexContainer alignCenter justifyBetween">
                <div className="accountItem flexContainer alignCenter gap-10">
                    <MdFingerprint size={24} />
                    Elder Account
                </div>
                {elderAddress ? (
                    <div className="accountValue flexContainer alignCenter justifyCenter gap-10">
                        {getMaskedValue(elderAddress)}
                        <CopyToClipboard textToCopy={elderAddress} />
                    </div>
                ) : (
                    renderButton("Request Elder Account", () =>
                        getElderAccountInfo()
                    )
                )}
            </div>
        );
    };

    const renderButton = (text, handleClick) => (
        <button className="btn-outline" onClick={handleClick}>
            {text}
        </button>
    );

    const renderAccount = () => {
        return (
            <div className="cardWithNoBorder flexGrowOne">
                {renderAccountRow()}
                {renderElderAccountRow()}
            </div>
        );
    };

    return renderAccount();
};

export default AccountInfo;
