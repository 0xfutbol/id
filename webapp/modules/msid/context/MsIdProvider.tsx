import { siteConfig } from "@/config/site";
import { authService } from "@/modules/msid/services/AuthService";
import { decodeJWT } from "@/utils/decodeJWT";
import type { Abi } from "abitype";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getContract } from "thirdweb";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { useActiveWallet, useActiveWalletConnectionStatus, useDisconnect } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
import { accountService } from "../services/AccountService";
import { METASOCCER_ID_REFERRER, useReferrerParam } from "./useReferrerParam";

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

export const getSavedJWT = (): string | undefined => {
  return localStorage?.getItem(METASOCCER_ID_JWT) || undefined;
};

export const setSavedJWT = (jwt: string | undefined) => {
  if (jwt) {
    console.debug("[MetaSoccer ID] Setting JWT in localStorage:", jwt);
    localStorage?.setItem(METASOCCER_ID_JWT, jwt);
  } else {
    console.debug("[MetaSoccer ID] Removing JWT from localStorage");
    localStorage?.removeItem(METASOCCER_ID_JWT);
  }
};

type MsIdContextProviderProps = { children: React.ReactNode };

const useMsIdState = () => {
  const status = useActiveWalletConnectionStatus();
  const activeWallet = useActiveWallet();
  const account = activeWallet?.getAccount();

  const { disconnect } = useDisconnect();

  useReferrerParam();

  const redirectUri = useRef<string | undefined>(undefined);
  const savedJWTChecked = useRef(false);
  const username = useRef<string | undefined>(undefined);
  const validJWT = useRef<string | undefined>(undefined);

  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const metaSoccerIdContract = useMemo(() => getContract({
    address: METASOCCER_ID_CONTRACT_ADDRESS,
    abi: ABI,
    client: siteConfig.thirdwebClient,
    chain: siteConfig.chain
  }), []);

  const claim = useCallback(async (username: string) => {
    console.debug("[MetaSoccer ID] Claiming username:", username);
    if (!account) throw new Error("No account found");

    const { claimed, signature, signatureExpiration } = await authService.claimSignature(username, account.address);
    console.debug("[MetaSoccer ID] Claim signature response:", { claimed, signature, signatureExpiration });

    const handleClaimedUsername = async (username: string) => {
      console.debug("[MetaSoccer ID] Handling claimed username:", username);
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await account.signMessage({ message });
        console.debug("[MetaSoccer ID] Signed message:", signedMessage);
        const jwt = await authService.getJWT(username, signedMessage, expiration);
        console.debug("[MetaSoccer ID] JWT received:", jwt);
        login(jwt);
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    const handleUnclaimedUsername = async (username: string, signature: string, signatureExpiration: bigint) => {
      console.debug("[MetaSoccer ID] Handling unclaimed username:", username);
      // @ts-expect-error
      const contract = await ethers6Adapter.contract.toEthers({ thirdwebContract: metaSoccerIdContract, account });

      const tx = await contract.registerUsername(username, signature, signatureExpiration, { gasLimit: 420000 });
      await tx.wait();
      console.debug("[MetaSoccer ID] Transaction completed:", tx);

      if (tx) {
        const jwtExpiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
        const jwt = await authService.getClaimJWT(username, signature, signatureExpiration, jwtExpiration);
        console.debug("[MetaSoccer ID] Claim JWT received:", jwt);
        login(jwt);
      }
    };

    if (claimed) {
      return handleClaimedUsername(username);
    } else {
      return handleUnclaimedUsername(username, signature, signatureExpiration);
    }
  }, [account, activeWallet, metaSoccerIdContract]);

  const login = useCallback((jwt: string) => {
    console.debug("[MetaSoccer ID] Logging in with JWT:", jwt);

    setIsAuthenticated(true);
    setSavedJWT(jwt);

    username.current = decodeJWT(jwt).payload.username;
    validJWT.current = jwt;

    if (redirectUri.current) {
      window.parent.postMessage({ type: 'JWT', jwt }, redirectUri.current);
    }
  }, []);

  const logout = useCallback(() => {
    console.debug("[MetaSoccer ID] Logging out");
    if (activeWallet) {
      disconnect(activeWallet);
    }

    setIsAuthenticated(false);
    setIsClaimPending(false);
    setIsWaitingForSignature(false);
    setSavedJWT(undefined);

    username.current = undefined;
    validJWT.current = undefined;

    if (redirectUri.current) {
      window.parent.postMessage({ type: 'JWT', jwt: undefined }, redirectUri.current);
    }
  }, [activeWallet, disconnect]);

  const signForJWT = useCallback(async (account: Account, username: string) => {
    console.debug("[MetaSoccer ID] Signing for JWT with username:", username);
    const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
    const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());

    setIsWaitingForSignature(true);
    try {
      const signedMessage = await account.signMessage({ message });
      console.debug("[MetaSoccer ID] Signed message for JWT:", signedMessage);
      return await authService.getJWT(username, signedMessage, expiration);
    } finally {
      setIsWaitingForSignature(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uri = urlParams.get('redirect_uri');
    console.debug("[MetaSoccer ID] Redirect URI:", uri);
    redirectUri.current = uri ?? undefined;
  }, []);

  useEffect(() => {
    if (!account?.address) return;

    const checkExistingToken = async () => {
      console.debug("[MetaSoccer ID] Checking existing token for account:", account.address);
      const existingJWT = getSavedJWT();
      const existingToken = existingJWT ? decodeJWT(existingJWT).payload : undefined;
      const existingTokenExpiration = existingToken?.expiration;
      const existingTokenOwner = existingToken?.owner;

      if (existingJWT && existingTokenExpiration && existingTokenExpiration >= Date.now() && 
          existingTokenOwner && existingTokenOwner.toLowerCase() === account.address.toLowerCase()) {
        console.debug("[MetaSoccer ID] Existing valid JWT found:", existingJWT);
        login(existingJWT);
      } else {
        console.debug("[MetaSoccer ID] Checking account:", account.address);
        const { username } = await authService.pre(account.address);
        if (username) {
          console.debug("[MetaSoccer ID] Username found for account:", username);
          const jwt = await signForJWT(account, username);
          login(jwt)
        } else {
          console.debug("[MetaSoccer ID] No username found, claim pending");
          setIsClaimPending(true);
        }
      }

      savedJWTChecked.current = true;
    };

    const pingAccount = async () => {
      console.debug("[MetaSoccer ID] Pinging account service with address:", account.address);
      accountService.ping(account.address, localStorage.getItem(METASOCCER_ID_REFERRER) ?? undefined);
    };

    checkExistingToken();
    pingAccount();
  }, [account?.address]);

  useEffect(() => {
    const switchChain = async () => {
      const activeChainId = activeWallet?.getChain()?.id;
      console.debug("[MetaSoccer ID] Active chain ID:", activeChainId);
      if (activeChainId && activeChainId !== siteConfig.chain.id) {
        setIsSwitchingChain(true);
        try {
          await activeWallet.switchChain(siteConfig.chain);
          console.debug("[MetaSoccer ID] Switched chain to:", siteConfig.chain.id);
        } catch (error) {
          console.debug("[MetaSoccer ID] Error switching chain:", error);
          disconnect(activeWallet);
        } finally {
          setIsSwitchingChain(false);
        }
      }
    };
    switchChain();
  }, [activeWallet, disconnect]);

  useEffect(() => {
    if (!savedJWTChecked.current) return;

    if (status === "disconnected") {
      console.debug("[MetaSoccer ID] Status is disconnected, logging out");
      logout();
    }
  }, [status, logout]);

  return {
    address: account?.address,
    isAuthenticated,
    isClaimPending,
    isSwitchingChain,
    isWaitingForSignature,
    status,
    username: username.current,
    claim,
    logout
  };
};

const MsIdContext = React.createContext<ReturnType<typeof useMsIdState> | undefined>(undefined);

const MsIdContextProvider = ({ children }: MsIdContextProviderProps) => {
  const state = useMsIdState();
  return <MsIdContext.Provider value={state}>{children}</MsIdContext.Provider>;
};

export { MsIdContext, MsIdContextProvider };
