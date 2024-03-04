import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BettingContractABI from './contracts/BettingContract.json';

const contractAddress = "VOTRE_ADRESSE_DE_CONTRAT";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  // Demander l'accès au compte Ethereum de l'utilisateur
  const requestAccount = async () => {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(account);
  };

  // Placer un pari
  const placeBet = async (matchId, predictedScoreHome, predictedScoreAway) => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, BettingContractABI.abi, signer);

    const transaction = await contract.placeBet(matchId, predictedScoreHome, predictedScoreAway);
    await transaction.wait();

    console.log('Pari placé', transaction.hash);
  };

  return (
    <div>
      <button onClick={requestAccount}>Connecter Wallet</button>
      <button onClick={() => placeBet(1, 2, 1)}>Placer Pari</button>
    </div>
  );
}

export default App;
