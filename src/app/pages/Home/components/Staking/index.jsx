/* eslint-disable prettier/prettier */
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../../../../../web3";
import { sendElderCustomTransaction, getElderMsgAndFee } from "elderjs";
import { formatNumber } from "../../../../../utils/helper";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
// import ToggleBtn from "../../../../components/ToggleBtn";
import './styles.css';

const getStakingViews = async account => {
    const signer = provider.getSigner(account);
    const staking = STAKING_CONTRACT.connect(signer);
    const [staked, reward, totalStaked] = await Promise.all([
        staking.stakedOf(account),
        staking.rewardOf(account),
        staking.totalStaked(),
    ]);
    return {
        staked: ethers.utils.formatEther(staked),
        reward: ethers.utils.formatEther(reward),
        totalStaked: ethers.utils.formatEther(totalStaked),
    };
};

const createUnsignedTransaction = async (message, elderFee, publicKey, elderAccSeq) => {
    const fee = elderFee;

    var unsignedTx = {
        body: {
            messages: [message],
            memo: 'Example transaction',
            timeoutHeight: 0,
        },
        authInfo: {
            signerInfos: [{
                publicKey: {
                    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                    value: publicKey
                },
                modeInfo: {
                    single: {
                        mode: 'SIGN_MODE_DIRECT'
                    }
                },
                sequence: elderAccSeq
            }],
            fee: fee
        },
        signatures: [] // Empty for unsigned transaction
    };

    return unsignedTx;
};

const broadcastTransaction = async (signedTx) => {
    try {
        console.log('Broadcasting transaction:', Buffer.from(JSON.stringify(signedTx)));
        
        const response = await fetch(ELDER_CHAIN_CONFIG.rpc + '/broadcast_tx_commit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tx: Buffer.from(JSON.stringify(signedTx)).toString('base64')
            })
        });

        const data = await response.json();
        console.log('Transaction Broadcast Result:', data);
        return data;
    } catch (error) {
        console.error('Error broadcasting transaction:', error);
        throw error;
    }
};

const Staking = ({ account, elderAddress, elderClient }) => {
    const [views, setViews] = useState({});
    const [stake, setStake] = useState("");
    const [withdraw, setWithdraw] = useState("");
    // const [isShibEnabled, setIsShibEnabled] = useState(false);

    // const handleToggle = () => {
    //     setIsShibEnabled(!isShibEnabled);
    // };

    const handleStake = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const amount = ethers.utils.parseEther(stake);

        const dummyToken = DUMMY_TOKEN.connect(signer);
        const allowance = await dummyToken.allowance(
            account,
            STAKING_CONTRACT.address
        );
        if (allowance.lt(amount)) {
            const tx = await dummyToken.populateTransaction.approve(STAKING_CONTRACT.address, amount);

            // getElderMsgAndFee(tx, elderAddress, rollappGasLimit, rollapValueTransfer, rollappChainID)
            let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);

            let signature;

            try {
                const [account] = await window.ethereum.request({
                    method: "eth_accounts",
                });
                // Sign with MetaMask
                signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [JSON.stringify(elderMsg), account]
                });

                console.log("Signature:", signature);

                const msgHash = ethers.utils.hashMessage(elderMsg);
                const msgHashBytes = ethers.utils.arrayify(msgHash);
                const recoveredPublicKey = ethers.utils.recoverPublicKey(msgHashBytes, signature);

                // Convert to compressed format if needed
                const compressedPublicKey = ethers.utils.computePublicKey(recoveredPublicKey, true);


                let elderAccount = await elderClient.getAccount(elderAddress);
                let elderAccSeq = elderAccount.sequence.toString();

                let unsignedTx = await createUnsignedTransaction(elderMsg, elderFee, compressedPublicKey, elderAccSeq);
                unsignedTx.signatures = [signature];

                console.log("Signed Transaction:", unsignedTx);
                let resp = await elderClient.broadcastTx(unsignedTx);
                console.log("Broadcasted Transaction:", resp);
                // await broadcastTransaction(unsignedTx);
            } catch (error) {
                console.error('An error occurred:', error);
            }

            // await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
        }

        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.populateTransaction.stake(amount);

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);

        // Sign with MetaMask
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [JSON.stringify(elderMsg), signer]
        });

        console.log("Signature:", signature);
        // await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
    };

    const objectToByteArrayNodeJs = (obj) => {
        const json = JSON.stringify(obj);
        return Buffer.from(json, 'utf-8');
      };

    const handleWithdraw = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const amount = ethers.utils.parseEther(withdraw);
        const tx = await staking.populateTransaction.withdraw(amount);

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);
        let signature;

        try {
            const [account] = await window.ethereum.request({
                method: "eth_accounts",
            });
            // Sign with MetaMask
            signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [JSON.stringify(elderMsg), account]
            });

            console.log("Signature:", signature);

            const msgHash = ethers.utils.hashMessage(JSON.stringify(elderMsg));
            const msgHashBytes = ethers.utils.arrayify(msgHash);
            const recoveredPublicKey = ethers.utils.recoverPublicKey(msgHashBytes, signature);

            // Convert to compressed format if needed
            const compressedPublicKey = ethers.utils.computePublicKey(recoveredPublicKey, true);


            let elderAccount = await elderClient.getAccount(elderAddress);
            let elderAccSeq = elderAccount.sequence.toString();

            var unsignedTx = await createUnsignedTransaction(elderMsg, elderFee, compressedPublicKey, elderAccSeq);
            unsignedTx.signatures = [signature];

            var unsignedTxByteArray = objectToByteArrayNodeJs(unsignedTx);
            var uArray = Uint8Array.from(unsignedTxByteArray);
            console.log("Unsigned Transaction Byte Array:", unsignedTxByteArray);
            console.log("Signed Transaction:", unsignedTx);
            console.log("Uint8Array:", uArray);
            let resp = await elderClient.broadcastTx(uArray);
            console.log("Broadcasted Transaction Resp:", resp);
            // await broadcastTransaction(unsignedTx);
        } catch (error) {
            console.error('An error occurred:', error);
        }

        // await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
    };

    const handleClaimReward = async () => {
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.populateTransaction.claimReward();

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);
        await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
    };

    useEffect(() => {
        getStakingViews(account, provider).then(setViews).catch(console.error);
    }, [account, provider]);

    if (!views.staked) {
        return (
            <div className="card">
                <h2>Staking</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="card m-t-10">
            <div className="cardHeading m-b-25">STAKING</div>

            {/* <div className="cardHeading m-b-25">
                <ToggleBtn
                    text1="Use $ELDER gasFee"
                    text2="Use $SHIB gasFee"
                    value={isShibEnabled}
                    toggleValue={handleToggle}
                    id="feature-toggle"
                /> </div> */}
            <div className="flexContainer flexDirectionColumn">
                <div className="flexContainer justifyBetween m-t-10 stakingCardsContainer">
                    <div className="stakingCards">
                        <div className="stakingCardsValue colorGreenLight">{formatNumber(views.staked, 2)} $TREAT</div>
                        <div className="stakingCardsLabel">Staked</div>
                    </div>
                    <div className="stakingCards">
                        <div className="stakingCardsValue colorGreenLight">{formatNumber(views.reward, 2)} $TREAT</div>
                        <div className="stakingCardsLabel">Reward</div>
                    </div>
                    <div className="stakingCards">
                        <div className="stakingCardsValue colorGreenLight">{formatNumber(views.totalStaked, 2)} $TREAT</div>
                        <div className="stakingCardsLabel">Total Staked</div>
                    </div>
                </div>
                <div className="flexContainer flexDirectionColumn m-r-15 m-t-15">
                    <div className="tableRow gap-15 m-t-40">
                        <label htmlFor="stake" className="tableCell">STAKE</label>
                        <input
                            id="stake"
                            placeholder="0.0 $TREAT"
                            className="tableCell btn-small borderBox"
                            value={stake}
                            onChange={e => setStake(e.target.value)}
                        />
                        <button onClick={handleStake} className="tableCell btn btn-outline btn-big borderBox">Stake $TREAT</button>
                    </div>
                    <div className="tableRow gap-15 m-t-15">
                        <label htmlFor="withdraw" className="tableCell">WITHDRAW</label>
                        <input
                            id="withdraw"
                            className="tableCell btn-small borderBox"
                            placeholder="0.0 $TREAT"
                            value={withdraw}
                            onChange={e => setWithdraw(e.target.value)}
                        />
                        <button onClick={handleWithdraw} className="tableCell btn btn-outline btn-big borderBox">Withdraw $TREAT</button>
                    </div>
                    <div className="tableRow gap-15 m-t-40 claimReward">
                        <button className="tableCell btn btn-primary btn-sparkle" onClick={handleClaimReward}>Claim Reward</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Staking;
