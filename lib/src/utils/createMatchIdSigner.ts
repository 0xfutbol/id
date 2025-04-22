import { chains } from '@/config';
import { BlockTag, FeeData, Provider, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { Hooks } from '@matchain/matchid-sdk-react';
import { BigNumber, ethers, Signer, TypedDataDomain, TypedDataField } from 'ethers';
import { Deferrable } from 'ethers/lib/utils';
import { TypedDataDefinition } from 'viem';

function getChainConfig(chainId: number) {
  const chain = Object.entries(chains).find(([, config]) => config.ref.id === chainId);

  if (!chain) {
    throw new Error(`Chain not found for chainId: ${chainId}`);
  }

  const [key, chainDef] = chain;

  const config = {
    id: chainDef.ref.id,
    name: chainDef.ref.name ?? key.toUpperCase(),
    nativeCurrency: {
      name: chainDef.ref.nativeCurrency?.name ?? 'UNKNOWN',
      symbol: chainDef.ref.nativeCurrency?.symbol ?? 'UNKNOWN',
      decimals: chainDef.ref.nativeCurrency?.decimals ?? 18,
    },
    rpcUrls: {
      default: {
        http: [chainDef.ref.rpc],
      },
    },
  };

  const provider = new ethers.providers.JsonRpcProvider(chainDef.ref.rpc);

  return {
    config,
    provider,
  };
}

export class MatchIdSigner implements Signer {
  _isSigner: boolean = true;
  chain: ReturnType<typeof getChainConfig>["config"];
  provider?: Provider;

  constructor(private chainId: number, private wallet: ReturnType<typeof Hooks.useWallet>) {
    const { config, provider } = getChainConfig(chainId);
    this.chain = config;
    this.provider = provider;
    console.log(`[MatchIdSigner] Initialized with provider:`, this.provider ? 'connected' : 'undefined');
  }

  async getAddress(): Promise<string> {
    console.log(`[MatchIdSigner] Getting address: ${this.wallet.address}`);
    return this.wallet.address;
  }

  async signMessage(message: string): Promise<string> {
    console.log(`[MatchIdSigner] Signing message:`, message);
    const signature = await this.wallet.evmAccount?.signMessage?.({ message });
    console.log(`[MatchIdSigner] Message signed successfully:`, signature);
    return signature ?? Promise.reject('No signing method available');
  }

  async signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    console.log(`[MatchIdSigner] Signing transaction:`, transaction);
    if (!this.provider) {
      throw new Error('No provider connected');
    }
  
    const tx = await this.populateTransaction(transaction);
    console.log(`[MatchIdSigner] Populated transaction for signing:`, tx);
  
    if (!tx.gasLimit || tx.gasLimit == 0) {
      throw new Error('Gas limit is zero or undefined after population');
    }

    console.log({
      chain: this.chain,
      transaction: {
        type: "eip2930",
        chainId: this.chain.id,
        nonce: parseInt(tx.nonce?.toString() ?? '0'),
        gas: BigInt(tx.gasLimit.toString()), // Use populated gasLimit
        gasPrice: BigInt(tx.gasPrice?.toString() ?? '0'),
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value?.toString() ?? '0'),
      },
    });
  
    const signedTx = await this.wallet?.signTransaction?.({
      chain: this.chain,
      transaction: {
        type: "eip2930",
        chainId: this.chain.id,
        nonce: parseInt(tx.nonce?.toString() ?? '0'),
        gas: BigInt(tx.gasLimit.toString()), // Use populated gasLimit
        gasPrice: BigInt(tx.gasPrice?.toString() ?? '0'),
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value?.toString() ?? '0'),
      },
    });
    console.log(`[MatchIdSigner] Transaction signed successfully:`, signedTx);
    return signedTx ?? Promise.reject('No signing method available');
  }

  connect(provider: Provider): Signer {
    // @ts-ignore
    const chainId = provider._network?.chainId;

    if (chainId) {
      console.log(`[MatchIdSigner] Connected to existing provider on chain:`, chainId);
      const { config, provider } = getChainConfig(chainId);
      this.chain = config;
      this.provider = provider;
      return new MatchIdSigner(chainId, this.wallet);
    } else {
      console.log(`[MatchIdSigner] Connecting to new provider`);
      provider.getNetwork().then((network) => {
        console.log(`[MatchIdSigner] Connected to new provider:`, network.chainId);
        const { config, provider } = getChainConfig(network.chainId);
        this.chain = config;
        this.provider = provider;
      });
      return this;
    }
  }

  async getBalance(blockTag?: BlockTag): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Getting balance for address: ${this.wallet.address}, blockTag: ${blockTag}`);
    const balance = await this.provider.getBalance(this.wallet.address, blockTag);
    console.log(`[MatchIdSigner] Balance retrieved:`, balance.toString());
    return balance;
  }

  async getTransactionCount(blockTag?: BlockTag): Promise<number> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Getting transaction count for address: ${this.wallet.address}, blockTag: ${blockTag}`);
    const count = await this.provider.getTransactionCount(this.wallet.address, blockTag);
    console.log(`[MatchIdSigner] Transaction count:`, count);
    return count;
  }

  async estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Estimating gas for transaction:`, transaction);
    const tx = await this.populateTransaction(transaction);
    console.log(`[MatchIdSigner] Populated transaction for gas estimation:`, tx);
    const gasEstimate = await this.provider.estimateGas(tx);
    console.log(`[MatchIdSigner] Gas estimate:`, gasEstimate.toString());
    return gasEstimate;
  }

  async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Calling transaction`, transaction, blockTag);
    const tx = await this.populateTransaction(transaction);
    delete tx.nonce;
    delete tx.gasPrice;
    delete tx.gasLimit;
    console.log(`[MatchIdSigner] Populated transaction for call`, tx);
    const result = await this.provider.call(tx, blockTag);
    console.log(`[MatchIdSigner] Call successful`, result);
    if (result === '0x') {
      throw new Error('Contract call reverted with no data');
    }
    return result;
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Sending transaction`, transaction);
    const tx = await this.populateTransaction(transaction);
    console.log(`[MatchIdSigner] Populated transaction for sending`, tx);

    const signedTx = await this.signTransaction(tx);
    console.log(`[MatchIdSigner] Transaction signed successfully, length: ${signedTx.length}`);
    const response = await this.provider.sendTransaction(signedTx);
    console.log(`[MatchIdSigner] Transaction sent successfully`, {
      hash: response.hash,
      blockNumber: response.blockNumber,
      confirmations: response.confirmations,
    });
    return response;
  }

  async getChainId(): Promise<number> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Getting chain ID`);
    const network = await this.provider.getNetwork();
    console.log(`[MatchIdSigner] Chain ID:`, network.chainId);
    return network.chainId;
  }

  async getGasPrice(): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Getting gas price`);
    const gasPrice = await this.provider.getGasPrice();
    console.log(`[MatchIdSigner] Gas price:`, gasPrice?.toString() || '0');
    return gasPrice ?? BigNumber.from(0); // Fallback to 0 if null
  }

  async getFeeData(): Promise<FeeData> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Getting fee data`);
    const feeData = await this.provider.getFeeData();
    console.log(`[MatchIdSigner] Fee data:`, feeData);
    return {
      gasPrice: feeData.gasPrice ?? null,
      maxFeePerGas: feeData.maxFeePerGas ?? null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? null,
      lastBaseFeePerGas: feeData.lastBaseFeePerGas ?? null,
    };
  }

  async resolveName(name: string): Promise<string> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Resolving name:`, name);
    const address = await this.provider.resolveName(name);
    console.log(`[MatchIdSigner] Name resolution result:`, address || 'not resolved');
    return address ?? Promise.reject(`Could not resolve name: ${name}`);
  }

  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
    console.log(`[MatchIdSigner] Checking transaction:`, transaction);
    return transaction;
  }

  async populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
    if (!this.provider) {
      throw new Error('No provider connected');
    }
  
    const tx = { ...transaction } as TransactionRequest;
  
    if (!tx.from) {
      tx.from = await this.getAddress();
    }
  
    // Set nonce for state-changing transactions
    if (!tx.nonce) {
      tx.nonce = await this.getTransactionCount();
    }
  
    // Set gas price for state-changing transactions
    if (!tx.gasPrice) {
      const feeData = await this.getFeeData();
      tx.gasPrice = feeData.gasPrice ?? undefined;
    }
  
    // Estimate gas limit for state-changing transactions
    if (!tx.gasLimit && tx.to && tx.data) {
      const gasEstimate = await this.provider.estimateGas({
        from: tx.from,
        to: tx.to,
        data: tx.data,
        value: tx.value || 0,
        gasPrice: tx.gasPrice,
      });
      tx.gasLimit = gasEstimate.mul(12).div(10); // Add 20% buffer to gas estimate
      console.log(`[MatchIdSigner] Estimated gas limit: ${tx.gasLimit.toString()}`);
    }
  
    if (!tx.chainId) {
      tx.chainId = await this.getChainId();
    }
  
    return tx;
  }

  _checkProvider(operation?: string): void {
    if (!this.provider) {
      throw new Error(`No provider connected${operation ? ` for ${operation}` : ''}`);
    }
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    // @ts-ignore
    const typedData: TypedDataDefinition = { domain, types, message: value };
    // @ts-ignore
    return this.wallet.evmAccount?.signTypedData?.(typedData) ?? Promise.reject('Typed data signing not supported');
  }
}