import { chains as chainsConfig } from "@/config";
import { WaasService } from "@/services/WaasService";
import { ChainName } from "@0xfutbol/constants";
import { BlockTag, FeeData, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Signer, TypedDataDomain, TypedDataField, utils } from "ethers";
import { Deferrable } from "ethers/lib/utils";

export class MetaSoccerWaaSSigner extends Signer {
  constructor(
    readonly waas: WaasService,
    readonly walletId: string,
    readonly address: string,
    readonly chain: ChainName,
    readonly chainId?: number,
  ) {
    super();
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async signMessage(message: string): Promise<string> {
    const { signature } = await this.waas.signMessage(this.walletId, message);
    return signature;
  }

  async signTransaction(_transaction: Deferrable<TransactionRequest>): Promise<string> {
    throw new Error("signTransaction is not supported for WaaS signer");
  }

  connect(provider: any): Signer {
    void provider;
    return this;
  }

  async getBalance(_blockTag?: BlockTag): Promise<BigNumber> {
    const chainId = await this.getChainId();
    const { balanceWei } = await this.waas.getNativeBalance(this.walletId, chainId);
    return BigNumber.from(balanceWei);
  }

  async getTransactionCount(_blockTag?: BlockTag): Promise<number> {
    const chainId = await this.getChainId();
    const { nonce } = await this.waas.getTransactionCount(this.walletId, chainId);
    return nonce;
  }

  async estimateGas(_transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    const { tx, chainId } = await this.prepareTransaction(_transaction);
    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }
    const params = this.toRpcParams(tx, chainId);
    const { gasLimitWei } = await this.waas.estimateGas(this.walletId, params);
    return BigNumber.from(gasLimitWei);
  }

  async call(_transaction: Deferrable<TransactionRequest>, _blockTag?: BlockTag): Promise<string> {
    if (_blockTag && _blockTag !== "latest") {
      throw new Error("Custom block tags are not supported for WaaS signer");
    }
    const { tx, chainId } = await this.prepareTransaction(_transaction);
    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }
    const params = this.toRpcParams(tx, chainId);
    const { result } = await this.waas.call(this.walletId, params);
    return result;
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    const { tx } = await this.prepareTransaction(transaction);
    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }

    const data = tx.data && tx.data !== "0x" ? tx.data.toString() : undefined;
    const valueWei = tx.value !== undefined ? BigNumber.from(tx.value).toString() : "0";
    const txHash = data
      ? (await this.waas.callContract(this.walletId, tx.to.toString(), data, valueWei)).txHash
      : (await this.waas.sendNative(this.walletId, tx.to.toString(), valueWei)).txHash;

    const response: TransactionResponse = {
      hash: txHash,
      from: this.address,
      confirmations: 0,
      wait: async () =>
        ({
          status: 1,
          transactionHash: txHash,
        } as any),
    } as any;

    return response;
  }

  async getChainId(): Promise<number> {
    if (this.chainId) return this.chainId;
    const chainRef = chainsConfig[this.chain]?.ref;
    if (chainRef?.id) return chainRef.id;
    throw new Error("Chain ID is not available for WaaS signer");
  }

  async getGasPrice(): Promise<BigNumber> {
    const chainId = await this.getChainId();
    const { gasPriceWei } = await this.waas.getGasPrice(this.walletId, chainId);
    return BigNumber.from(gasPriceWei);
  }

  async getFeeData(): Promise<FeeData> {
    const chainId = await this.getChainId();
    const feeData = await this.waas.getFeeData(this.walletId, chainId);
    return {
      gasPrice: feeData.gasPriceWei ? BigNumber.from(feeData.gasPriceWei) : null,
      maxFeePerGas: feeData.maxFeePerGasWei ? BigNumber.from(feeData.maxFeePerGasWei) : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGasWei ? BigNumber.from(feeData.maxPriorityFeePerGasWei) : null,
      lastBaseFeePerGas: feeData.lastBaseFeePerGasWei ? BigNumber.from(feeData.lastBaseFeePerGasWei) : null,
    };
  }

  async resolveName(_name: string): Promise<string> {
    throw new Error("resolveName is not supported for WaaS signer");
  }

  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
    const from = (transaction as any)?.from;
    if (from && from.toString().toLowerCase() !== this.address.toLowerCase()) {
      throw new Error("WaaS signer can only operate from its configured address");
    }
    return transaction;
  }

  async populateTransaction(_transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
    const { tx, chainId } = await this.prepareTransaction(_transaction, { requireTo: false });
    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }

    if (tx.nonce === undefined) {
      tx.nonce = await this.getTransactionCount();
    }

    if (!tx.gasLimit) {
      try {
        tx.gasLimit = await this.estimateGas(tx);
      } catch (error) {
        console.warn("[MetaSoccerWaaSSigner] Failed to estimate gas", error);
      }
    }

    if (!tx.gasPrice && tx.maxFeePerGas === undefined && tx.maxPriorityFeePerGas === undefined) {
      const feeData = await this.getFeeData();
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        tx.maxFeePerGas = feeData.maxFeePerGas;
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      } else if (feeData.gasPrice) {
        tx.gasPrice = feeData.gasPrice;
      }
    }

    tx.chainId = chainId;

    return tx;
  }

  private async prepareTransaction(
    transaction: Deferrable<TransactionRequest>,
    options: { requireTo?: boolean } = { requireTo: true },
  ): Promise<{ tx: TransactionRequest; chainId: number }> {
    const tx = await utils.resolveProperties(transaction);
    const chainId = tx.chainId ?? (await this.getChainId());
    const from = (tx.from ?? this.address).toString();
    if (from.toLowerCase() !== this.address.toLowerCase()) {
      throw new Error("WaaS signer can only operate from its configured address");
    }
    if (options.requireTo && !tx.to) {
      throw new Error("Transaction 'to' is required");
    }

    return { tx: { ...tx, from, chainId }, chainId };
  }

  private toRpcParams(tx: TransactionRequest, chainId: number) {
    return {
      chainId,
      toAddress: tx.to?.toString() ?? "",
      data: tx.data ? tx.data.toString() : undefined,
      valueWei: tx.value !== undefined ? BigNumber.from(tx.value).toString() : undefined,
      gasLimit: tx.gasLimit !== undefined ? BigNumber.from(tx.gasLimit).toString() : undefined,
      gasPriceWei: tx.gasPrice !== undefined ? BigNumber.from(tx.gasPrice).toString() : undefined,
      maxFeePerGasWei: tx.maxFeePerGas !== undefined ? BigNumber.from(tx.maxFeePerGas).toString() : undefined,
      maxPriorityFeePerGasWei:
        tx.maxPriorityFeePerGas !== undefined ? BigNumber.from(tx.maxPriorityFeePerGas).toString() : undefined,
      nonce: tx.nonce !== undefined ? BigNumber.from(tx.nonce).toNumber() : undefined,
    };
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    const { signature } = await this.waas.signTypedData(this.walletId, domain, types, value);
    return signature;
  }
}

type CreateMetaSoccerWaaSSignerParams = {
  waasBaseUrl: string;
  waasSessionToken: string;
  walletId: string;
  walletAddress: string;
  chain: ChainName;
  chainId?: number;
  waasService?: WaasService;
};

export function createMetaSoccerWaaSSigner(params: CreateMetaSoccerWaaSSignerParams): Signer {
  const waas = params.waasService ?? new WaasService(params.waasBaseUrl, params.waasSessionToken);
  return new MetaSoccerWaaSSigner(waas, params.walletId, params.walletAddress, params.chain, params.chainId);
}
