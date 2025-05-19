import { ChainName } from "@0xfutbol/constants";
import { AUTH_MESSAGE, MAX_SIGNATURE_EXPIRATION } from "@0xfutbol/id-sign";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { OxFUTBOL_ID_REFERRER, useReferrerParam } from "@/hooks";
import { useWeb3Context } from "@/providers/Web3Context";
import { AuthStatus } from "@/providers/types";
import { AccountService, AuthService } from "@/services";
import { decodeJWT, getSavedJWT, setSavedJWT } from "@/utils";
import { Signer } from "ethers";

type AuthContextProviderProps = {
  backendUrl: string;
  chainToSign: ChainName;
  children: React.ReactNode
};

const useAuthContextState = (backendUrl: string, chainToSign: ChainName) => {
  const { address, status, signer, web3Ready } = useWeb3Context();

  const isConnecting = useRef(false);

  useReferrerParam();

  const authService = useMemo(() => new AuthService(backendUrl), [backendUrl]);
  const accountService = useMemo(() => new AccountService(backendUrl), [backendUrl]);

  const username = useRef<string | undefined>(undefined);
  const validJWT = useRef<string | undefined>(undefined);

  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");
  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);

  const claim = useCallback(async (username: string) => {
    if (!address) throw new Error("No address found");
    if (!signer) throw new Error("No signer found");

    console.debug("[0xFútbol ID] Claiming username:", username);
    const { claimed, signature, signatureExpiration } = await authService.sign(username, address);
    console.debug("[0xFútbol ID] Claim signature response:", { claimed, signature, signatureExpiration });

    const handleClaimedUsername = async (username: string) => {
      console.debug("[0xFútbol ID] Handling claimed username:", username);
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await signer[chainToSign].signMessage(message);
        console.debug("[0xFútbol ID] Signed message:", signedMessage);
        const jwt = await authService.getJWT(username, signedMessage, expiration);
        console.debug("[0xFútbol ID] JWT received");
        login(jwt);
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    const handleUnclaimedUsername = async (username: string) => {
      console.debug("[0xFútbol ID] Handling unclaimed username:", username);
      const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
      const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());
      setIsWaitingForSignature(true);
      try {
        const signedMessage = await signer[chainToSign].signMessage(message);
        console.debug("[0xFútbol ID] Signed message:", signedMessage);
        await authService.claim(username, address, signedMessage, expiration);
        console.debug("[0xFútbol ID] Registered username");
        const jwt = await authService.getJWT(username, signedMessage, expiration);
        console.debug("[0xFútbol ID] JWT received");
        login(jwt);
      } finally {
        setIsWaitingForSignature(false);
      }
    };

    if (claimed) {
      return handleClaimedUsername(username);
    } else {
      return handleUnclaimedUsername(username);
    }
  }, [address, signer]);

  const login = useCallback((jwt: string) => {
    console.debug("[0xFútbol ID] Logging in with JWT");

    setAuthStatus("authenticated");
    setSavedJWT(jwt);

    username.current = decodeJWT(jwt).payload.username;
    validJWT.current = jwt;
  }, []);

  const logout = useCallback(() => {
    console.debug("[0xFútbol ID] Logging out");

    setAuthStatus("unauthenticated");
    setIsClaimPending(false);
    setIsWaitingForSignature(false);
    setSavedJWT(undefined);

    username.current = undefined;
    validJWT.current = undefined;
  }, []);

  const signForJWT = useCallback(async (username: string, signer: Signer) => {
    if (!signer) throw new Error("No signer found");

    console.debug("[0xFútbol ID] Signing for JWT with username:", username);
    const expiration = Date.now() + MAX_SIGNATURE_EXPIRATION;
    const message = AUTH_MESSAGE.replace("{username}", username).replace("{expiration}", expiration.toString());

    setIsWaitingForSignature(true);
    try {
      const signedMessage = await signer.signMessage(message);
      console.debug("[0xFútbol ID] Signed message for JWT:", signedMessage);
      return await authService.getJWT(username, signedMessage, expiration);
    } finally {
      setIsWaitingForSignature(false);
    }
  }, []);

  useEffect(() => {
    if (!web3Ready) return;

    if (isConnecting.current) {
      console.debug("[0xFútbol ID] Already connecting, skipping");
      return;
    }

    (async () => {
      isConnecting.current = true;

      if (status === "connected") {
        const currentAddress = address!;
  
        const checkExistingToken = async () => {
          console.debug("[0xFútbol ID] Checking existing token for account:", currentAddress);
          const existingJWT = getSavedJWT();
          const existingToken = existingJWT ? decodeJWT(existingJWT).payload : undefined;
          const existingTokenExpiration = existingToken?.expiration;
          const existingTokenOwner = existingToken?.owner;
    
          if (existingJWT && existingTokenExpiration && existingTokenExpiration >= Date.now() && 
              existingTokenOwner && existingTokenOwner.toLowerCase() === currentAddress.toLowerCase()) {
            console.debug("[0xFútbol ID] Existing valid JWT found");
            login(existingJWT);
          } else {
            console.debug("[0xFútbol ID] Checking account:", currentAddress);
            const { username } = await authService.pre(currentAddress);
            if (username) {
              console.debug("[0xFútbol ID] Username found for account:", username);
              const jwt = await signForJWT(username, signer![chainToSign]);
              login(jwt)
            } else {
              console.debug("[0xFútbol ID] No username found, claim pending");
              setIsClaimPending(true);
              setAuthStatus("unauthenticated");
            }
          }
        };
    
        const pingAccount = async () => {
          console.debug("[0xFútbol ID] Pinging account service with address:", currentAddress);
          accountService.ping(currentAddress, localStorage.getItem(OxFUTBOL_ID_REFERRER) ?? undefined);
        };
    
        await checkExistingToken();
        await pingAccount();
      }

      else if (status === "disconnected") {
        console.debug("[0xFútbol ID] Status is disconnected, logging out");
        logout();
      }

      else {
        console.debug("[0xFútbol ID] Status is ", status, "and signer is ", signer);
      }

      isConnecting.current = false;
    })();
  }, [chainToSign, signer, status, web3Ready]);

  return {
    authStatus,
    isClaimPending,
    isWaitingForSignature,
    username: username.current,
    claim
  };
};

export const AuthContext = React.createContext<ReturnType<typeof useAuthContextState> | undefined>(undefined);

export const AuthContextProvider = ({ backendUrl, chainToSign, children }: AuthContextProviderProps) => {
  const state = useAuthContextState(backendUrl, chainToSign);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within a AuthContextProvider");
	}
	return context;
};