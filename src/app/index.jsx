import React from "react";
import CosmosWalletHome from "./pages/CosmosWallet_Home";
import EthWalletHome from "./pages/EthWallet_Home";
import WalletSelection from "./pages/WalletSelection_Home";
import "../utils/styles.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const router = (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<WalletSelection />} />
            <Route path="/cosmos" element={<CosmosWalletHome />} />
            <Route path="/eth" element={<EthWalletHome />} />
        </Routes>
    </BrowserRouter>
);

const App = () => {

    return router;
};

export default App;
