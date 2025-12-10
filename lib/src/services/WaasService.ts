type Headers = Record<string, string>;

export class WaasService {
  constructor(private readonly baseUrl: string, private readonly sessionToken: string) {}

  private async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.sessionToken}`,
      } as Headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const payload = await res.text();
      throw new Error(`WaaS error ${res.status}: ${payload}`);
    }
    return res.json() as Promise<T>;
  }

  signMessage(walletId: string, message: string) {
    return this.post<{ signature: string }>(`/wallets/${walletId}/sign-message`, { message });
  }

  signTypedData(walletId: string, domain: any, types: any, value: any) {
    return this.post<{ signature: string }>(`/wallets/${walletId}/sign-typed-data`, { domain, types, value });
  }

  sendNative(walletId: string, toAddress: string, amountWei: string, memo?: string) {
    return this.post<{ txHash: string }>(`/wallets/${walletId}/transfer/native`, { toAddress, amountWei, memo });
  }

  callContract(walletId: string, contractAddress: string, data: string, valueWei?: string, memo?: string) {
    return this.post<{ txHash: string }>(`/wallets/${walletId}/contract-call`, {
      contractAddress,
      data,
      valueWei,
      memo,
    });
  }
}
