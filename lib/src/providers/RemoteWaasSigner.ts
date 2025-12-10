import { ChainName } from "@0xfutbol/constants";
import { Signer, utils, providers } from "ethers";
import { WaasService } from "@/services/WaasService";

export class RemoteWaasSigner extends Signer {
  constructor(
    readonly waas: WaasService,
    readonly walletId: string,
    readonly address: string,
    readonly chain: ChainName
  ) {
    super();
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async signMessage(message: utils.Arrayish | string): Promise<string> {
    const msg = typeof message === "string" ? message : utils.hexlify(message as any);
    const { signature } = await this.waas.signMessage(this.walletId, msg);
    return signature;
  }

  async _signTypedData(domain: any, types: any, value: any): Promise<string> {
    const { signature } = await this.waas.signTypedData(this.walletId, domain, types, value);
    return signature;
  }

  async sendTransaction(transaction: providers.TransactionRequest): Promise<providers.TransactionResponse> {
    const tx = await utils.resolveProperties(transaction as any);
    if (!tx.to) {
      throw new Error("Transaction 'to' is required");
    }

    const data = tx.data && tx.data !== "0x" ? tx.data.toString() : undefined;
    const valueWei = tx.value ? tx.value.toString() : "0";
    let txHash: string;

    if (data) {
      txHash = (await this.waas.callContract(this.walletId, tx.to.toString(), data, valueWei)).txHash;
    } else {
      txHash = (await this.waas.sendNative(this.walletId, tx.to.toString(), valueWei)).txHash;
    }

    const response: providers.TransactionResponse = {
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

  connect(provider: providers.Provider): Signer {
    // Remote signer does not use a local provider; return self for compatibility.
    void provider;
    return this;
  }
}
