/* eslint-disable prettier/prettier */
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../../rpc_eth_web3";
import { cosmos_getElderMsgAndFeeTxRaw } from "elderjs";
import { formatNumber } from "../../../../../utils/helper";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
import { toast } from 'react-toastify';
// import ToggleBtn from "../../../../components/ToggleBtn";
import './styles.css';

const getStakingViews = async account => {
    const [staked, reward, totalStaked] = await Promise.all([
        STAKING_CONTRACT.stakedOf(account),
        STAKING_CONTRACT.rewardOf(account),
        STAKING_CONTRACT.totalStaked(),
    ]);
    return {
        staked: ethers.formatEther(staked),
        reward: ethers.formatEther(reward),
        totalStaked: ethers.formatEther(totalStaked),
    };
};

const Staking = ({ account, elderAddress, elderClient, elderPublicKey }) => {
    const [views, setViews] = useState({});
    const [stake, setStake] = useState("");
    const [withdraw, setWithdraw] = useState("");
    // const [isShibEnabled, setIsShibEnabled] = useState(false);

    // const handleToggle = () => {
    //     setIsShibEnabled(!isShibEnabled);
    // };

    const handleStake = async event => {
        event.preventDefault();
        const amount = ethers.parseEther(stake);

        const allowance = await DUMMY_TOKEN.allowance(
            account,
            STAKING_CONTRACT.target
        );

        if (allowance < amount) {
            const tx = await DUMMY_TOKEN.approve.populateTransaction(STAKING_CONTRACT.target, amount);

            let { tx_hash, rawTx } = await cosmos_getElderMsgAndFeeTxRaw(tx, elderAddress, elderPublicKey, 1000000, ethers.parseEther("0"), ELDER_CHAIN_CONFIG.rollChainID, ELDER_CHAIN_CONFIG.rollID, ELDER_CHAIN_CONFIG.chainName);
            const broadcastResult = await elderClient.broadcastTx(rawTx);

            if (broadcastResult.code !== 0) {
                toast.error(`Approval Transaction failed`);
                return;
            }

            toast.success(`Approval Transaction Hash: ${tx_hash}`);
        }

        const tx = await STAKING_CONTRACT.stake.populateTransaction(amount);

        let { tx_hash, rawTx } = await cosmos_getElderMsgAndFeeTxRaw(tx, elderAddress, elderPublicKey, 1000000, ethers.parseEther("0"), ELDER_CHAIN_CONFIG.rollChainID, ELDER_CHAIN_CONFIG.rollID, ELDER_CHAIN_CONFIG.chainName);
        const broadcastResult = await elderClient.broadcastTx(rawTx);

        if (broadcastResult.code !== 0) {
            toast.error(`Staking Transaction failed`);
            return;
        }

        toast.success(`Staking Transaction Hash: ${tx_hash}`);
    };

    const handleWithdraw = async event => {
        event.preventDefault();

        const amount = ethers.parseEther(withdraw);
        const tx = await STAKING_CONTRACT.withdraw.populateTransaction(amount);

        let { tx_hash, rawTx } = await cosmos_getElderMsgAndFeeTxRaw(tx, elderAddress, elderPublicKey, 1000000, ethers.parseEther("0"), ELDER_CHAIN_CONFIG.rollChainID, ELDER_CHAIN_CONFIG.rollID, ELDER_CHAIN_CONFIG.chainName);
        const broadcastResult = await elderClient.broadcastTx(rawTx);

        if (broadcastResult.code !== 0) {
            toast.error(`Withdraw Transaction failed`);
            return;
        }

        toast.success(`Withdraw Transaction Hash: ${tx_hash}`);
    };

    const handleClaimReward = async () => {
        const tx = await STAKING_CONTRACT.claimReward.populateTransaction();

        let { tx_hash, rawTx } = await cosmos_getElderMsgAndFeeTxRaw(tx, elderAddress, elderPublicKey, 1000000, ethers.parseEther("0"), ELDER_CHAIN_CONFIG.rollChainID, ELDER_CHAIN_CONFIG.rollID, ELDER_CHAIN_CONFIG.chainName);
        const broadcastResult = await elderClient.broadcastTx(rawTx);

        if (broadcastResult.code !== 0) {
            toast.error(`Claim Reward Transaction failed`);
            return;
        }

        toast.success(`Claim Reward Transaction Hash: ${tx_hash}`);
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
