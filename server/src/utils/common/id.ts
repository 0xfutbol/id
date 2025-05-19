import { OxFutbolID } from "@0xfutbol/id-sign";
import { Wallet } from "ethers";
import { verifyMessage, verifyTypedData } from "ethers/lib/utils";
import jwt from "jsonwebtoken";

const AUTH_MESSAGE = 'Authenticate with MetaSoccerID\n\nID: {username}\n\nExpiration: {expiration}';
const MAX_SIGNATURE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// uninstall jsonwebtoken adn ethers

class LegacyOxFutbolID {
  // Instance Variables
  private chainId: number;
  private contractAddress: string;
  private jwtSecret: string;
  private privateKey?: string;
  private wallet?: Wallet;

  constructor(params: {
    chainId: number;
    contractAddress: string;
    jwtSecret: string;
    privateKey?: string;
  }) {
    this.chainId = params.chainId;
    this.contractAddress = params.contractAddress;
    this.jwtSecret = params.jwtSecret;
    if (params.privateKey) {
      this.privateKey = params.privateKey;
      this.wallet = new Wallet(this.privateKey);
    }
  }

  // Public Methods

  public createJWT(username: string, owner: string, signature: string, expiration: number, claims?: object): string {
    const payload = { username, owner, signature, expiration, ...claims };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: expiration });
  }

  public async generateSignature(username: string, owner: string): Promise<{ signature: string, signatureExpiration: number }> {
    try {
      if (!this.wallet) {
        throw new Error('Private key is not set');
      }

      const domain = this.getDomain();
      const types = this.getTypes();
      const signatureExpiration = Math.floor(Date.now() / 1000) + Math.floor(MAX_SIGNATURE_EXPIRATION / 1000); // 7 days expiration
      const message = { username: username.trim(), owner, signatureExpiration };

      const signature = await this.wallet._signTypedData(domain, types, message);

      return { signature, signatureExpiration };
    } catch (error) {
      console.error('Error creating claim signature:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      throw new Error('Internal server error');
    }
  }
  
  public getAuthMessage(username: string, expiration: number): string {
    return AUTH_MESSAGE.replace('{username}', username).replace(
      '{expiration}',
      expiration.toString()
    );
  }

  public isValidSignatureExpiration(expiration: number): boolean {
    const currentTimestamp = Date.now();
    return expiration - currentTimestamp <= MAX_SIGNATURE_EXPIRATION;
  }

  public async validateSignature(
    message: string,
    owner: string,
    username: string,
    expiration?: number
  ) {
    if (message.startsWith('CLAIM:')) {
      await this.validateClaimSignature(message, owner, username);
    } else {
      if (expiration === undefined) {
        throw new Error('Expiration is required for user signature validation');
      }
      await this.validateUserSignature(message, owner, username, expiration);
    }
  }

  public verifyJWT(token: string, callback: any) {
    jwt.verify(token, this.jwtSecret, (err: Error | null, decoded: any) => {
      if (err) {
        callback(err, undefined);
      } else {
        if (this.isValidSignatureExpiration(decoded.expiration)) {
          callback(null, decoded);
        } else {
          callback(new Error('Signature expired'), undefined);
        }
      }
    });
  }

  // Private Methods

  private getDomain() {
    return {
      name: 'MetaSoccerID',
      version: '1',
      chainId: this.chainId,
      verifyingContract: this.contractAddress,
    };
  }

  private getTypes() {
    return {
      Username: [
        { name: 'username', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'signatureExpiration', type: 'uint256' },
      ],
    };
  }

  private async validateUserSignature(
    message: string,
    owner: string,
    username: string,
    expiration: number
  ) {
    const recoveredAddress = verifyMessage(
      this.getAuthMessage(username, expiration),
      message
    );

    if (!this.isValidOwner(owner, recoveredAddress)) {
      throw new Error('Unauthorized');
    }
  }

  private async validateClaimSignature(
    message: string,
    owner: string,
    username: string
  ) {
    const [signature, signatureExpirationStr] = message.slice(6).split('.');
    const signatureExpiration = parseInt(signatureExpirationStr, 10);

    // Validate that signatureExpiration hasn't expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > signatureExpiration + 60) {
      throw new Error('Signature expired');
    }

    if (!this.wallet) {
      throw new Error('Private key is not set');
    }

    const domain = this.getDomain();
    const types = this.getTypes();

    const recoveredAddress = verifyTypedData(
      domain,
      types,
      { username, owner, signatureExpiration },
      signature
    );

    if (
      recoveredAddress.toLowerCase() !== this.wallet.address.toLowerCase()
    ) {
      throw new Error('Unauthorized');
    }
  }

  private isValidOwner(owner: string, recoveredAddress: string): boolean {
    return owner.toLowerCase() === recoveredAddress.toLowerCase();
  }
}

export const oxFutboId = process.env.USE_MODERN == "true" ? new OxFutbolID({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
}) : new LegacyOxFutbolID({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});
