/* eslint-disable prettier/prettier */
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../../../../../web3";
import { sendElderCustomTransaction, getElderMsgAndFee, chainMap } from "elderjs";
import { formatNumber } from "../../../../../utils/helper";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
import { Registry } from "@cosmjs/proto-signing";
import { MsgSubmitRollTx } from "./elder_proto/dist/router/tx.js";
import { ElderDirectSecp256k1Wallet } from "../../../../../utils/elderDirectSigner.ts";
import { makeSignDoc, makeAuthInfoBytes, encodeSecp256k1Signature } from "@cosmjs/proto-signing"
// import ToggleBtn from "../../../../components/ToggleBtn";
import './styles.css';

const customMessageTypeUrl = "/elder.router.MsgSubmitRollTx";

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

const Staking = ({ account, elderAddress, elderClient, elderAccountNumber }) => {
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
            let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID, elderAccountNumber);
            await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
        }

        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.populateTransaction.stake(amount);

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID, elderAccountNumber);
        await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
    };

    const handleWithdraw = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const amount = ethers.utils.parseEther(withdraw);
        const tx = await staking.populateTransaction.withdraw(amount);

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID, elderAccountNumber);
        // await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);

        try {
            const [account] = await window.ethereum.request({
                method: "eth_accounts",
            });
            // Sign with MetaMask
            const sig = await window.ethereum.request({
                method: 'personal_sign',
                params: [JSON.stringify(elderMsg), account]
            });
            console.log("Signature:", sig);
            const msgHash = ethers.utils.hashMessage(JSON.stringify(elderMsg));
            const msgHashBytes = ethers.utils.arrayify(msgHash);
            const recoveredPublicKey = ethers.utils.recoverPublicKey(msgHashBytes, sig);

            const compressedPublicKey = ethers.utils.computePublicKey(recoveredPublicKey, true);

            console.log("Recovered Public Key:", compressedPublicKey);

            let elderAccount = await elderClient.getAccount(elderAddress);
            let elderAccSeq = elderAccount.sequence.toString();

            const authInfoBytes = makeAuthInfoBytes(
                [{ compressedPublicKey, elderAccSeq }],
                elderFee.amount,
                elderFee.gas,
                undefined,
                undefined,
            );

            const registry = new Registry();
            registry.register(customMessageTypeUrl, MsgSubmitRollTx);

            const txBodyBytes = registry.encode(elderMsg);
            const chainId = chainMap.get(ELDER_CHAIN_CONFIG.chainName).chainId;

            const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, elderAccountNumber);

            const signingWallet = new ElderDirectSecp256k1Wallet.fromCompressedPublicKey(compressedPublicKey);
            const { signature } = await signingWallet.signDirect(elderAddress, signDoc);

            console.log("Sign Response:", signature);

            const txRaw = {
                bodyBytes: signDoc.bodyBytes,
                authInfoBytes: signDoc.authInfoBytes,
                signatures: [encodeSecp256k1Signature(compressedPublicKey, signature.signature)]
              };

            try {
                const broadcastResult = await elderClient.broadcastTx(txRaw);
                console.log('Transaction broadcasted:', broadcastResult);
              } catch (error) {
                console.error('Error broadcasting transaction:', error);
              }

        } catch (error) {
            console.error(error);
        }
    };

    const handleClaimReward = async () => {
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.populateTransaction.claimReward();

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID, elderAccountNumber);
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
