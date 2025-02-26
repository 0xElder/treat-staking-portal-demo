import React, { useState } from "react";
import Staking from "./components/Staking";
import DummyToken from "./components/DummyToken";
import { Balance } from "./components/Balance";
import { TreatPortal } from "./components/TreatPortal";
import { provider } from "./wallet_eth_web3";
import AccountInfo from "./components/AccountInfo";
import { ToastContainer } from 'react-toastify';
// import ToggleBtn from "../../components/ToggleBtn";
import "./styles.css";

const Home = () => {
    const [account, setAccount] = useState(null);
    const [elderAddress, setElderAddress] = useState(null);
    const [elderPublicKey, setElderPublicKey] = useState(null);

    return (
        <div className="homeContainer">
            <div className="flexContainer gap-10 card m-b-10">
                <TreatPortal />
            </div>
            <div className="flexContainer gap-10 card m-t-15">
                <Balance account={account} />
                <AccountInfo
                    account={account}
                    setAccount={setAccount}
                    elderAddress={elderAddress}
                    setElderAddress={setElderAddress}
                    setElderPublicKey={setElderPublicKey}
                />
            </div>
            {provider && account && (
                <>
                    <div className="flexContainer gap-20 m-t-10">
                        <Staking
                            account={account}
                            elderAddress={elderAddress}
                            elderPublicKey={elderPublicKey}
                        />
                        <DummyToken
                            account={account}
                            elderAddress={elderAddress}
                            elderPublicKey={elderPublicKey}
                        />
                    </div>
                </>
            )}
            <ToastContainer />
            {/* <ToggleBtn text="Enable" /> */}
        </div>
    );
};

export default Home;
