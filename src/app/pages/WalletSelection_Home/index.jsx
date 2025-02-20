import React from 'react'
import { Link } from 'react-router-dom';


export default function WalletSelection() {
  return (
    <div>
      <h1>WALLET SELECT</h1>
      <h2><Link to="/eth">ETH</Link> | <Link to="/cosmos">COSMOS</Link></h2>
    </div>
  )
}
