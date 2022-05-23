import React, { useState, useMemo, useEffect } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { findReference, FindReferenceError } from '@solana/pay';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { InfinitySpin } from 'react-loader-spinner';

import IPFSDownload from './IpfsDownload';
import { addOrder, hasPurchased, fetchItem } from '../lib/api';

const STATUS = {
  Initial: 'Initial',
  Submitted: 'Submitted',
  Paid: 'Paid',
};

export default function Buy({ itemID }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // public key used to identify the order

  const [item, setItem] = useState(null); // IPFS hash & filename of the purchased item
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.Initial); // tracking the status of the transaction

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

    // We create a transaction object
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);

    // attempt to send transaction to network
    try {
      // Send the transaction to the network
      const txHash = await sendTransaction(tx, connection);
      console.log(`Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`);
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // check if this address already has purchased this item
    // if yes, fetch the item and set the status to Paid
    // make async function to avoid blocking the UI
    async function checkPurchased() {
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        console.log("This address has already purchased this item");
        const item = await fetchItem(itemID);
        setItem(item);
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);

  useEffect(() => {
    // check if transaction has been submitted
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          // look for orderID on the blockchain
          const res = await findReference(connection, orderID);
          console.log('Finding tx reference', res.confirmationStatus);

          // If the transaction is confirmed or finalized, the payment was successful!
          if (res.confirmationStatus === 'confirmed' || res.confirmationStatus === 'finalized') {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            setLoading(false);
            addOrder(order);
            alert('Thank you for your purchase!')
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error('Unknown error ', e);

        } finally {
          setLoading(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    async function getItem(itemID) {
      const item = await fetchItem(itemID);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }
  }, [status]);

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
      {status === STATUS.Paid ? (
        <IPFSDownload
          filename='Pikachu-3d'
          hash='QmZqiXvUQGXgRQEnZiqhBMrB9YXdLa8rfWFLDUP66wf5Tk'
          cta='Download origami'
        />
      ) : (
        <button disabled={loading} className='buy-button' onClick={processTransaction}>
          Buy Now
        </button>
      )}
    </div>
  );
}