
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
const privateKey = process.env.ONCHAIN_PRIVATE_KEY!;

export const wallet = new ethers.Wallet(privateKey, provider);

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

export async function registerUsername(username: string, signature: string, signatureExpiration: number) {
  try {
    console.log("Registering username:", username, signature, signatureExpiration);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    const tx = await contract.registerUsername(username, signature, signatureExpiration, { gasLimit: 420000 });
    const receipt = await tx.wait();

    console.log(`Transaction successful with hash: ${JSON.stringify(receipt)}`);
    return receipt;
  } catch (error: any) {
    console.error('Error calling smart contract:', error.message ?? 'Unknown error', error);
    throw new Error(error.message ?? 'Failed to call smart contract');
  }
}
