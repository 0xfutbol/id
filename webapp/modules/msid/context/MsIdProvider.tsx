import { siteConfig } from "@/config/site";
import { idService } from "@/modules/msid/services/IdService";
import { decodeJWT } from "@/utils/decodeJWT";
import type { Abi } from "abitype";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { getContract } from "thirdweb";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { useActiveWallet, useActiveWalletConnectionStatus } from "thirdweb/react";

const ABI: Abi = [
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

const AUTH_MESSAGE = 'Authenticate with MetaSoccerID\n\nID: {username}\n\nExpiration: {expiration}';
const MAX_SIGNATURE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;  // 7 days in milliseconds
const METASOCCER_ID_CONTRACT_ADDRESS = "0x34C1c1d83FDf111ECf0Fa0A74B2B934D4153663e";
const METASOCCER_ID_JWT = "METASOCCER_ID_JWT";

type MsIdContextProviderProps = { children: React.ReactNode };

const useMsIdState = () => {
  const status = useActiveWalletConnectionStatus();
  const activeWallet = useActiveWallet();
  const account = activeWallet?.getAccount();

  const [savedJWT, setSavedJWT] = useLocalStorage<string>(METASOCCER_ID_JWT);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [savedJWTChecked, setSavedJWTChecked] = useState(false);
  const [validJWT, setValidJWT] = useState<string | undefined>();

  const metaSoccerIdContract = useMemo(() => getContract({
    address: METASOCCER_ID_CONTRACT_ADDRESS,
    abi: ABI,
    client: siteConfig.thirdwebClient,
    chain: siteConfig.chain
  }), []);

  const claim = useCallback(async (username: string) => {
    if (!account) throw new Error("No account found");

    const { claimed, signature, signatureExpiration } = await idService.claimSignature(username, account.address);

    const handleClaimedUsername = async (username: string) => {
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await account.signMessage({ message });
        const jwt = await idService.getJWT(username, signedMessage, expiration);
        setValidJWT(jwt);
        return jwt;
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    const handleUnclaimedUsername = async (username: string, signature: string, signatureExpiration: bigint) => {
      // @ts-expect-error
      const contract = await ethers6Adapter.contract.toEthers({ thirdwebContract: metaSoccerIdContract, account });

      const tx = await contract.registerUsername(username, signature, signatureExpiration, { gasLimit: 3000000 });
      await tx.wait();

      if (tx) {
        const jwtExpiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
        const jwt = await idService.getClaimJWT(username, signature, signatureExpiration, jwtExpiration);
        setValidJWT(jwt);
        return jwt;
      }
    };

    if (claimed) {
      return handleClaimedUsername(username);
    } else {
      return handleUnclaimedUsername(username, signature, signatureExpiration);
    }
  }, [account, activeWallet, metaSoccerIdContract]);

  const invalidateJWT = useCallback(() => {
    setValidJWT(undefined);
    setSavedJWT(undefined);
  }, [setSavedJWT]);

  const signForJWT = useCallback(async (username: string) => {
    if (!account) throw new Error("No account connected");
    const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
    const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
    setIsWaitingForSignature(true);
    try {
      const signedMessage = await account.signMessage({ message });
      return await idService.getJWT(username, signedMessage, expiration);
    } finally {
      setIsWaitingForSignature(false);
    }
  }, [account]);

  useEffect(() => {
    if (!account?.address) return;

    const checkExistingToken = async () => {
      const existingToken = savedJWT ? decodeJWT(savedJWT).payload : undefined;
      const existingTokenExpiration = existingToken?.expiration;
      const existingTokenOwner = existingToken?.owner;

      if (existingTokenExpiration && existingTokenExpiration >= Date.now() && 
          existingTokenOwner && existingTokenOwner.toLowerCase() === account.address.toLowerCase()) {
        setValidJWT(savedJWT);
      }

      setSavedJWTChecked(true);
    };
    checkExistingToken();
  }, [account?.address, savedJWT]);

  useEffect(() => {
    if (!account?.address) return;
    if (!savedJWTChecked) return;
    if (validJWT) return;

    const checkAccount = async () => {
      const { username } = await idService.pre(account.address);
      if (username) {
        const jwt = await signForJWT(username);
        setValidJWT(jwt);
      } else {
        setIsClaimPending(true);
      }
    };
    checkAccount();
  }, [account?.address, savedJWTChecked, validJWT, signForJWT]);

  useEffect(() => {
    if (status === "disconnected") {
      setValidJWT(undefined);
    }
  }, [status]);

  useEffect(() => {
    if (validJWT) {
      setIsAuthenticated(true);
      setSavedJWT(validJWT);
      setUsername(decodeJWT(validJWT).payload.username);
    } else {
      setIsAuthenticated(false);
      setIsClaimPending(false);
      setIsWaitingForSignature(false);
      setUsername(undefined);
    }
  }, [validJWT, setSavedJWT]);

  return {
    address: account?.address,
    isAuthenticated,
    isClaimPending,
    isWaitingForSignature,
    username,
    claim,
    invalidateJWT
  };
};

const MsIdContext = React.createContext<ReturnType<typeof useMsIdState> | undefined>(undefined);

const MsIdContextProvider = ({ children }: MsIdContextProviderProps) => {
  const state = useMsIdState();
  return <MsIdContext.Provider value={state}>{children}</MsIdContext.Provider>;
};

export { MsIdContext, MsIdContextProvider };
