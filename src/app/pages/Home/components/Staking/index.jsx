/* eslint-disable prettier/prettier */
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DUMMY_TOKEN, provider, STAKING_CONTRACT } from "../../../../../web3";
import { sendElderCustomTransaction, getElderMsgAndFee } from "elderjs";
import { formatNumber } from "../../../../../utils/helper";
import { ELDER_CHAIN_CONFIG } from "../../../../../../constants";
import { Registry } from "@cosmjs/proto-signing";
import { MsgSubmitRollTx } from "./elder_proto/router/tx.ts";
import { PubKey } from "./elder_proto/crypto/ethsecp256k1/keys.ts";
import { ElderDirectSecp256k1Wallet } from "../../../../../utils/ElderDirectSigner.ts";
// import { makeAuthInfoBytes} from "@cosmjs/proto-signing"
import { SigningStargateClient } from "@cosmjs/stargate";
import { AuthInfo, TxRaw, TxBody, Fee} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Buffer } from "buffer";
import { makeSignDoc, makeSignBytes } from "@cosmjs/proto-signing"


// import { encodeSecp256k1Signature } from "@cosmjs/amino";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import './styles.css';

const customMessageTypeUrl = "/elder.router.MsgSubmitRollTx";
const customelderpubsecp = "/elder.crypto.ethsecp256k1.PubKey";


function hexToUint8Array(hexString) {
    // Remove the '0x' prefix if it exists
    hexString = hexString.replace(/^0x/, '');
  
    // Ensure the length is even
    if (hexString.length % 2 !== 0) {
      throw new Error('Hex string must have an even number of characters');
    }
  
    // Convert the hex string to a Uint8Array
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
  
    return byteArray;
  }


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

        elderAddress = "elder1zwpjy8nj24g5y45yz9taup6nete0mftn6q30qk"

        let { elderMsg, elderFee } = getElderMsgAndFee(tx, elderAddress, 1000000, ethers.utils.parseEther("0"), 42769, ELDER_CHAIN_CONFIG.rollID, 0);
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

            const uncompressedPublicKey = ethers.utils.computePublicKey(recoveredPublicKey, false);
            console.log("Uncompressed Public Key:", uncompressedPublicKey);

            const compressedPublicKey = ethers.utils.computePublicKey(recoveredPublicKey, true);
            console.log("Recovered Public Key:", compressedPublicKey);

            var pubKeyBytes = hexToUint8Array(compressedPublicKey.slice(2));

            let registry = new Registry();
            registry.register(customMessageTypeUrl, MsgSubmitRollTx);
            registry.register(customelderpubsecp, PubKey);

            console.log("base64 pub key - ", toBase64(pubKeyBytes))

            // const pubkey = PubKey.fromPartial({
            //     key: customelderpubsecp, 
            //     value: pubKeyBytes,
            // });

            const pubkey = PubKey.encode(PubKey.fromPartial({
                    key: pubKeyBytes,
            })).finish()

            console.log("PUBKEY1 ", pubKeyBytes)
            console.log("PUBKEY2 ", pubkey)

            const pubk = {
                typeUrl: customelderpubsecp,
                value: pubkey,
            }

            // const pubkey = {
            //     typeUrl: customelderpubsecp,
            //     value: fromBase64(pubkeyProto) 
            // }

            // pubkey =PubKey.encode()

            let elderAccSeq = 8

            console.log("Pubkey:", pubkey);

            // var authInfoBytes
            console.log("compressedPublicKey:", compressedPublicKey);
            console.log("elderAccSeq:", elderAccSeq);
            console.log("elderFee:", elderFee.amount);
            console.log("elderFee:", elderFee.gas);
            // try {
            //     authInfoBytes = makeAuthInfoBytes(
            //         [{ pubkey, sequence: elderAccSeq }],
            //         elderFee.amount,
            //         elderFee.gas,
            //         undefined,
            //         undefined,
            //         SignMode.SIGN_MODE_DIRECT,
            //     );
            // } catch (error) {
            //     console.error("Error making Auth Info Bytes:", error);
            // }

            // console.log("Auth Info Bytes:", authInfoBytes);

            const bodyBytes = TxBody.encode(
                TxBody.fromPartial({
                    messages: [
                        {
                            typeUrl: customMessageTypeUrl,
                            value: MsgSubmitRollTx.encode(elderMsg.value).finish(),
                        }
                    ],
                })
            ).finish()
            

            const chainId = "elder_122018";
            let accountNumber = 0 
            const authInfoBytes2 = AuthInfo.encode(
                AuthInfo.fromPartial(
                    {
                        signerInfos: [
                            {
                                publicKey: pubk,
                                sequence: elderAccSeq,
                                modeInfo: {
                                    single: {
                                      mode: SignMode.SIGN_MODE_DIRECT,
                                    },
                                },
                            },
                        ],
                        fee: Fee.fromPartial({
                            amount: [{
                                denom: "uelder",
                                amount: "400000",
                            }],
                            gasLimit: 400000,
                        }),
                    },
                )
            ).finish()

            const signDoc = makeSignDoc(bodyBytes, authInfoBytes2, chainId, accountNumber);
            const signBytes = makeSignBytes(signDoc);

            console.log("SignBytes - ", signBytes)

            const signingWallet = await ElderDirectSecp256k1Wallet.fromCompressedPublicKey(pubKeyBytes);
            const { signature } = await signingWallet.signDirect(elderAddress, signDoc);

            console.log("Sign Response:", signature);
            console.log("Signs - ", Buffer.from(signature.signature, "base64"))

            const txRaw = TxRaw.fromPartial({
                bodyBytes: bodyBytes,
                authInfoBytes: authInfoBytes2,
                signatures: [fromBase64(signature.signature)],
            });


            console.log("Anshal - aaa")
            const txRawBytes = TxRaw.encode(txRaw).finish();

            // const txRawBytes = Uint8Array.from(txRaw);
            try {
                console.log("Broadcasting Transaction...", txRawBytes);
                const client = await SigningStargateClient.connectWithSigner(
                    "http://127.0.0.1:26657",
                    "elder_122018",
                    {
                        registry: registry,
                        aminoTypes: {
                            prefix: "elder"
                        }
                    }
                );
                console.log("bb")
                // const broadcastResult = await client.sendTokens("elder1zwpjy8nj24g5y45yz9taup6nete0mftn6q30qk", "elder108nm9kcfjrlwpyj5l8yqguen6yc2tdprusd9p5", "100uelder");
                const broadcastResult = await client.broadcastTx(txRawBytes)
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
