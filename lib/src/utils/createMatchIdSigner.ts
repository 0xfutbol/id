import { BlockTag, FeeData, Provider, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { Hooks } from '@matchain/matchid-sdk-react';
import { BigNumber, ethers, Signer, TypedDataDomain, TypedDataField } from 'ethers';
import { Deferrable } from 'ethers/lib/utils';
import { TypedDataDefinition } from 'viem';
import { toHex } from 'viem/utils';

export class MatchIdSigner implements Signer {
  _isSigner: boolean = true;
  provider?: Provider;

  constructor(private chain: ReturnType<typeof Hooks.useMatchChain>, private wallet: ReturnType<typeof Hooks.useWallet>) {
    this.provider = chain.chain?.rpcUrls.default.http[0]
      ? new ethers.providers.JsonRpcProvider(chain.chain.rpcUrls.default.http[0])
      : undefined;
  }

  async getAddress(): Promise<string> {
    return this.wallet.address;
  }

  async signMessage(message: string): Promise<string> {
    return this.wallet.evmAccount?.signMessage?.({ message }) ?? Promise.reject('No signing method available');
  }

  async signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    if (!this.provider) {
      throw new Error('No provider connected');
    }

    const tx = await this.populateTransaction(transaction);

    // Convert ethers.js transaction to Viem-compatible format
    const viemTx = {
      chainId: tx.chainId,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit ? BigNumber.from(tx.gasLimit).toNumber() : undefined,
      gasPrice: tx.gasPrice ? BigNumber.from(tx.gasPrice).toHexString() : undefined,
      maxFeePerGas: tx.maxFeePerGas ? BigNumber.from(tx.maxFeePerGas).toHexString() : undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? BigNumber.from(tx.maxPriorityFeePerGas).toHexString() : undefined,
      to: tx.to ? tx.to : undefined,
      value: tx.value ? BigNumber.from(tx.value).toHexString() : undefined,
      // @ts-ignore
      data: tx.data ? toHex(tx.data) : undefined,
    };

    // @ts-ignore
    return this.wallet.evmAccount?.signTransaction?.(viemTx) ?? Promise.reject('No signing method available');
  }

  connect(provider: Provider): Signer {
    const newSigner = new MatchIdSigner(this.chain, this.wallet);
    newSigner.provider = provider;
    return newSigner;
  }

  async getBalance(blockTag?: BlockTag): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    return this.provider.getBalance(this.wallet.address, blockTag);
  }

  async getTransactionCount(blockTag?: BlockTag): Promise<number> {
    if (!this.provider) throw new Error('No provider connected');
    return this.provider.getTransactionCount(this.wallet.address, blockTag);
  }

  async estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    const tx = await this.populateTransaction(transaction);
    return this.provider.estimateGas(tx);
  }
  async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Calling transaction`, { to: transaction.to, data: transaction.data });
    const tx = await this.populateTransaction(transaction);
    console.log(`[MatchIdSigner] Populated transaction for call`, { from: tx.from, to: tx.to, nonce: tx.nonce });

    const result = await this.provider.call(tx, blockTag);
    console.log(`[MatchIdSigner] Call successful`, { result });
    return result;
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    if (!this.provider) throw new Error('No provider connected');
    console.log(`[MatchIdSigner] Sending transaction`, { to: transaction.to, value: transaction.value });
    const tx = await this.populateTransaction(transaction);
    console.log(`[MatchIdSigner] Populated transaction for sending`, { 
      from: tx.from, 
      to: tx.to, 
      value: tx.value, 
      nonce: tx.nonce 
    });

    const signedTx = await this.signTransaction(tx);
    console.log(`[MatchIdSigner] Transaction signed successfully`);
    const response = await this.provider.sendTransaction(signedTx);
    console.log(`[MatchIdSigner] Transaction sent successfully`, { 
      hash: response.hash, 
      confirmations: response.confirmations 
    });
    return response;
  }

  async getChainId(): Promise<number> {
    if (!this.provider) throw new Error('No provider connected');
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async getGasPrice(): Promise<BigNumber> {
    if (!this.provider) throw new Error('No provider connected');
    const gasPrice = await this.provider.getGasPrice();
    return gasPrice ?? BigNumber.from(0); // Fallback to 0 if null
  }

  async getFeeData(): Promise<FeeData> {
    if (!this.provider) throw new Error('No provider connected');
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice ?? null,
      maxFeePerGas: feeData.maxFeePerGas ?? null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? null,
      lastBaseFeePerGas: feeData.lastBaseFeePerGas ?? null,
    };
  }

  async resolveName(name: string): Promise<string> {
    if (!this.provider) throw new Error('No provider connected');
    const address = await this.provider.resolveName(name);
    return address ?? Promise.reject(`Could not resolve name: ${name}`);
  }

  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
    return transaction;
  }

  async populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
    if (!this.provider) {
      throw new Error('No provider connected');
    }

    const tx = transaction as TransactionRequest;

    if (!tx.from) {
      tx.from = await this.getAddress();
    }

    if (!tx.nonce) {
      tx.nonce = await this.getTransactionCount();
    }

    if (!tx.gasPrice && !tx.maxFeePerGas) {
      const feeData = await this.getFeeData();
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        tx.maxFeePerGas = feeData.maxFeePerGas; // Already undefined if null
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas; // Already undefined if null
      } else {
        tx.gasPrice = feeData.gasPrice ?? undefined; // Already undefined if null
      }
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
    value: Record<string, any>
  ): Promise<string> {
    // @ts-ignore
    const typedData: TypedDataDefinition = { domain, types, message: value };
    // @ts-ignore
    return this.wallet.evmAccount?.signTypedData?.(typedData) ?? Promise.reject('Typed data signing not supported');
  }
}