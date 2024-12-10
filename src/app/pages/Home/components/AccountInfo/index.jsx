import React, { useEffect } from "react";
import { getElderClient } from "elderjs";
import { ELDER_CHAIN_CONFIG } from "../../constants";
import { getMaskedValue } from "../../../../../utils/helper";
import CopyToClipboard from "../../../../components/CopyToClipboard";
import { MdAccountBox, MdFingerprint } from "react-icons/md";
import "./styles.css";

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
                        getElderClient(ELDER_CHAIN_CONFIG)
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
