
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
const privateKey = process.env.ONCHAIN_PRIVATE_KEY!;

const contractAbi = ["function registerUsername(string username, string signature, uint256 signatureExpiration)"];
const contractAddress = process.env.ONCHAIN_CONTRACT_ADDRESS!;

export async function registerUsername(username: string, signature: string, signatureExpiration: number) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    const tx = await contract.registerUsername(username, signature, signatureExpiration, { gasLimit: 420000 });
    const receipt = await tx.wait();

    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    return receipt;
  } catch (error: any) {
    console.error('Error calling smart contract:', error.message ?? 'Unknown error', error);
    throw new Error(error.message ?? 'Failed to call smart contract');
  }
}
