import React, { useState, useMemo } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { InfinitySpin } from 'react-loader-spinner';

import IPFSDownload from './IpfsDownload';

export default function Buy({ itemID }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // public key used to identify the order

  const [paid, setPaid] = useState(null);
  const [loading, setLoading] = useState(false);

  const order = useMemo(() => ({
    buyer: publicKey.toString(),
    orderID: orderID.toString(),
    itemID,
  }), [publicKey, orderID, itemID]);

  // fetch transaction object from server
  const processTransaction = async () => {
    setLoading(true);
    const txResponse = await fetch("../api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    const txData = await txResponse.json();
    console.log('txData: ', txData);

    // We create a transaction object
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);

    // attempt to send transaction to network
    try {
      // Send the transaction to the network
      const txHash = await sendTransaction(tx, connection);
      console.log(`Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`);
      // Even though this could fail, we're just going to set it to true for now
      setPaid(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div>
        <p>Please connect to a wallet to make transactions.</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color='gray' />;
  }

  return (
    <div>
      {paid ? (
        <IPFSDownload filename='Pikachu-3d' hash='QmZqiXvUQGXgRQEnZiqhBMrB9YXdLa8rfWFLDUP66wf5Tk' cta='Download origami' />
      ) : (
        <button disabled={loading} className='buy-button' onClick={processTransaction}>
          Buy Now
        </button>
      )}
    </div>
  );
}