import React, { useState } from "react";
import Staking from "./components/Staking";
import DummyToken from "./components/DummyToken";
import { Balance } from "./components/Balance";
import { provider } from "../../../web3";
import AccountInfo from "./components/AccountInfo";
// import ToggleBtn from "../../components/ToggleBtn";
import "./styles.css";

const Home = () => {
    const [account, setAccount] = useState(null);
    const [elderAddress, setElderAddress] = useState(null);
    var [elderClient, setElderClient] = useState(null);

    return (
        <div className="homeContainer">
            <div className="flexContainer gap-10 card">
                <Balance account={account} />
                <AccountInfo
                    account={account}
                    setAccount={setAccount}
                    elderAddress={elderAddress}
                    setElderAddress={setElderAddress}
                    setElderClient={setElderClient}
                />
            </div>
            {provider && account && (
                <>
                    <div className="flexContainer gap-20 m-t-10">
                        <Staking
                            account={account}
                            elderAddress={elderAddress}
                            elderClient={elderClient}
                        />
                        <DummyToken account={account} />
                    </div>
                </>
            )}
            {/* <ToggleBtn text="Enable" /> */}
        </div>
    );
};

export default Home;
