import React, { useEffect } from "react";
import { getElderClient } from "elderjs";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
import { getMaskedValue } from "../../../../../utils/helper";
import CopyToClipboard from "../../../../components/CopyToClipboard";
import { MdAccountBox, MdFingerprint } from "react-icons/md";
import { ethers } from "ethers";

import "./styles.css";

function getEthereumAddressFromCosmosCompressedPubKey(compressedPubKey) {
    try {
        // Ensure the input is a valid hex string with 0x prefix
        if (!compressedPubKey.startsWith('0x')) {
            compressedPubKey = '0x' + compressedPubKey;
            console.log('Added 0x prefix:', compressedPubKey);
        }

        // Check if it's actually compressed (starts with 0x02 or 0x03)
        if (!compressedPubKey.startsWith('0x02') && !compressedPubKey.startsWith('0x03')) {
            throw new Error('Public key is not in compressed format (must start with 0x02 or 0x03)');
        }

        // Convert compressed key to uncompressed using ethers
        const uncompressedPubKey = ethers.SigningKey.computePublicKey(compressedPubKey, false);

        // Remove the 0x04 prefix from uncompressed key and compute address
        const pubKeyWithoutPrefix = uncompressedPubKey.slice(2);
        const address = ethers.computeAddress('0x' + pubKeyWithoutPrefix);

        return address;
    } catch (error) {
        console.error('Error calculating Ethereum address:', error.message);
        return null;
    }
}

const AccountInfo = ({
    account,
    setAccount,
    elderAddress,
    setElderAddress,
    setElderClient,
    setElderAccountNumber,
    setElderAccountSequence,
    setElderPublicKey,
}) => {
    useEffect(() => {
        if (window.keplr) {
            (async () => {
                const { elderAddress, elderClient, elderAccountNumber, elderAccountSequence, elderPublicKey } = await getElderClient(ELDER_CHAIN_CONFIG);

                setElderAddress(elderAddress);
                setElderClient(elderClient);
                setElderAccountNumber(elderAccountNumber);
                setElderAccountSequence(elderAccountSequence);
                setElderPublicKey(elderPublicKey);

                let ethAddress = getEthereumAddressFromCosmosCompressedPubKey(elderPublicKey);
                setAccount(ethAddress);
            })();
        }
    }, []);

    const requestAccounts = async () => {
        const { elderPublicKey } = await getElderClient(ELDER_CHAIN_CONFIG);

        let ethAddress = getEthereumAddressFromCosmosCompressedPubKey(elderPublicKey);
        setAccount(ethAddress);

        return ethAddress;
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
