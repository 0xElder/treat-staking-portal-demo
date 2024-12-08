import React, { useState } from "react";
import Staking from "./components/Staking";
import DummyToken from "./components/dummyToken";
import { Balance } from "./components/Balance";
import { provider } from "../../../web3";
import AccountInfo from "./components/AccountInfo";

const Home = () => {
    const [account, setAccount] = useState(null);
    const [elderAddress, setElderAddress] = useState(null);
    var [elderClient, setElderClient] = useState(null);

    return (
        <div>
            <div className="flexContainer">
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
                    <DummyToken account={account} />
                    <Staking
                        account={account}
                        elderAddress={elderAddress}
                        elderClient={elderClient}
                    />
                </>
            )}
        </div>
    );
};

export default Home;
