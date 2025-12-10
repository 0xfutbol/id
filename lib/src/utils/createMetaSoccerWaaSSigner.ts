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
    throw new Error("getBalance is not supported for WaaS signer");
  }

  async getTransactionCount(_blockTag?: BlockTag): Promise<number> {
    throw new Error("getTransactionCount is not supported for WaaS signer");
  }

  async estimateGas(_transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    throw new Error("estimateGas is not supported for WaaS signer");
  }

  async call(_transaction: Deferrable<TransactionRequest>, _blockTag?: BlockTag): Promise<string> {
    throw new Error("call is not supported for WaaS signer");
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    const tx = await utils.resolveProperties(transaction);

    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }

    const data = tx.data && tx.data !== "0x" ? tx.data.toString() : undefined;
    const valueWei = tx.value ? tx.value.toString() : "0";
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
    throw new Error("getGasPrice is not supported for WaaS signer");
  }

  async getFeeData(): Promise<FeeData> {
    throw new Error("getFeeData is not supported for WaaS signer");
  }

  async resolveName(_name: string): Promise<string> {
    throw new Error("resolveName is not supported for WaaS signer");
  }

  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
    return transaction;
  }

  async populateTransaction(_transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {
    throw new Error("populateTransaction is not supported for WaaS signer");
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
