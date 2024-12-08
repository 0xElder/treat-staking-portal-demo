/* eslint-disable prettier/prettier */
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../../../../../web3";
import { sendElderCustomTransaction, getElderMsgAndFee } from "elderjs";
import { ELDER_CHAIN_CONFIG } from "../../constants";
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

const Staking = ({ account, elderAddress, elderClient }) => {
    const [views, setViews] = useState({});
    const [stake, setStake] = useState("");
    const [withdraw, setWithdraw] = useState("");

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
            await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
        }

        const staking = STAKING_CONTRACT.connect(signer);

        const tx = await staking.populateTransaction.stake(amount);

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);
        await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
    };

    const handleWithdraw = async event => {
        event.preventDefault();
        const signer = provider.getSigner(account);
        const staking = STAKING_CONTRACT.connect(signer);

        const amount = ethers.utils.parseEther(withdraw);
        const tx = await staking.populateTransaction.withdraw(amount);
        
        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID);
        await sendElderCustomTransaction(elderAddress, elderClient, elderMsg, elderFee);
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
            <div>
                <h2>Staking</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
       <div className="card m-t-10">
            <div className="cardHeading">Staking</div>
            <div className="flexContainer flexDirectionColumn">
                <div className="flexContainer justifyBetween">
                    <p>
                        <strong className="inlineBlock width100">Staked </strong> <span className="colorGreenLight amountFont">{views.staked} DT</span>
                    </p>
                    <p className="m-r-20">
                        <strong className="inlineBlock width100">Total Staked </strong> <span className="colorGreenLight amountFont">{views.totalStaked} DT</span>
                    </p>
                </div>
                <div className="flexContainer justifyBetween m-b-15">
                    <p>
                        <strong className="inlineBlock width100">Reward </strong> <span className="colorGreenLight amountFont">{views.reward} DT</span>
                    </p>
                </div>
                <div className="horizontalDivider"></div>
                <div className="flexContainer flexDirectionColumn">
                    <form className="flexContainer gap-15 alignCenter m-t-15" onSubmit={handleStake}>
                        <label htmlFor="stake" className="width80">Stake</label>
                        <input
                            id="stake"
                            placeholder="0.0 DT"
                            className="inlineBlock btn-small borderBox"
                            value={stake}
                            onChange={e => setStake(e.target.value)}
                        />
                        <div className="inlineBlock width200">
                            <button type="submit" className="btn btn-outline btn-big borderBox">Stake DT</button>
                        </div>
                    </form>
                    <form className="flexContainer gap-15 alignCenter m-t-15" onSubmit={handleWithdraw}>
                        <label htmlFor="withdraw" className="width80">Withdraw</label>
                        <input
                            id="withdraw"
                            className="inlineBlock btn-small borderBox"
                            placeholder="0.0 DT"
                            value={withdraw}
                            onChange={e => setWithdraw(e.target.value)}
                        />
                        <div className="inlineBlock width200">
                            <button type="submit" className="btn btn-outline btn-big borderBox">Withdraw DT</button>
                        </div>
                    </form>
                    <div className="flexContainer m-t-15 claimReward">
                        <button className="btn btn-primary" onClick={handleClaimReward}>Claim Reward</button>
                    </div>
                </div>
            </div>
       </div>
    );
};

export default Staking;
