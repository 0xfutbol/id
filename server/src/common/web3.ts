
import axios from 'axios';
import { ethers, keccak256, parseEther, toUtf8Bytes } from 'ethers';
import { oxFutboId } from './id';

const FAUCET_URL = 'https://sfuel-faucet-h8r2g.ondigitalocean.app/gas';

const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
const privateKey = process.env.ONCHAIN_PRIVATE_KEY!;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAbi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "username",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "signatureExpiration",
        "type": "uint256"
      }
    ],
    "name": "registerUsername",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = process.env.ONCHAIN_CONTRACT_ADDRESS!;

export async function registerUsername(username: string) {
  try {
    // Enhancing transparency in the username registration process by transitioning to a new smart contract (OxFutbolID).
    // This allows the backend to register usernames onchain. Currently, the new contract is not deployed,
    // so we continue using the old contract (MetaSoccerID) and sign requests with the backend wallet address.
    // A new signature is generated using the backend wallet address for this purpose.
    console.debug(`[0xFútbol ID] Initiating signature generation for username: ${username} using wallet address: ${wallet.address}`);
    const { signature, signatureExpiration } = await oxFutboId.generateSignature(username, wallet.address);

    console.debug(`[0xFútbol ID] Signature generated. Proceeding to register username: ${username} with signature: ${signature} and expiration: ${signatureExpiration}`);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    const tx = await contract.registerUsername(username, signature, signatureExpiration, { gasLimit: 420000 });
    const receipt = await tx.wait();

    console.debug(`[0xFútbol ID] Username registration transaction successful. Hash: ${receipt.hash}`);
    generateOnchainTrail(signature);

    return receipt;
  } catch (error: any) {
    console.error('Error calling smart contract:', error.message ?? 'Unknown error', error);
    throw new Error(error.message ?? 'Failed to call smart contract');
  }
}

export async function generateOnchainTrail(signature: string) {
  try {
    console.debug(`[0xFútbol ID] Generating onchain trail for signature: ${signature}`);
    
    // Convert signature to a private key
    const privateKey = keccak256(toUtf8Bytes(signature));
    const trailWallet = new ethers.Wallet(privateKey, provider);
    
    console.debug(`[0xFútbol ID] Trail wallet created with address: ${trailWallet.address}`);

    await requestGasFromFaucet(trailWallet.address);

    // Wait between 300ms and 1 second before proceeding with the transaction
    const waitTime = Math.random() * (1000 - 300) + 300;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Send 0.000001 ETH from trail wallet to the original wallet
    const transaction = {
      to: wallet.address,
      value: parseEther("0.0000001"),
      gasLimit: 21000,
    };

    const txResponse = await trailWallet.sendTransaction(transaction);
    await txResponse.wait();

    console.debug(`[0xFútbol ID] Sent 0.000001 ETH from trail wallet to original wallet: ${wallet.address}`);
    console.debug(`[0xFútbol ID] Onchain trail generation completed for signature: ${signature}`);
  } catch (error: any) {
    console.error('Error generating onchain trail:', error.message ?? 'Unknown error', error);
  }
}

async function requestGasFromFaucet(address: string, retryCount = 1) {
  try {
    console.debug(`[0xFútbol ID] Requesting gas from faucet for address: ${address}, attempt: ${retryCount}`);
    const response = await axios.put(FAUCET_URL, { address }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.debug(`[0xFútbol ID] Faucet response received: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(`Error requesting gas from faucet (attempt ${retryCount}):`, error);
    if (retryCount < 2) {
      console.debug(`[0xFútbol ID] Retrying gas request for address: ${address}, attempt: ${retryCount + 1}`);
      await requestGasFromFaucet(address, retryCount + 1);
    } else {
      throw new Error('Failed to request gas from faucet after retry');
    }
  }
}
