import { fetchPacks } from "@/store/features/profile";
import { useAppDispatch } from "@/store/hooks";
import { useOxFutbolIdContext } from "@0xfutbol/id";
import { addToast } from "@heroui/toast";
import { ethers } from "ethers";

import PackGiftRedeemABI from "../abis/PackGiftRedeem.json";

const CONTRACT_ADDRESS = "0x385F843A89e7835b99D8016f3C3feD6FfED96759";

// Locks to prevent parallel execution
const locks = {
  claimGift: false,
  getRedeemedPacks: false,
  getMaxRedeemablePacks: false,
};

export const usePacks = () => {
  const dispatch = useAppDispatch();
  const { address, signer, walletProvider, switchChain } = useOxFutbolIdContext();

  const claimGift = async (): Promise<void> => {
    if (locks.claimGift) {
      console.warn("[usePacks] claimGift is already in progress");
      return;
    }

    locks.claimGift = true;

    try {
      console.log("[usePacks] Starting gift claim process", {
        address,
        walletProvider
      });

      if (!address) {
        console.error("[usePacks] No address available for gift claim");
        throw new Error("No address available");
      }

      if (!signer) {
        console.error("[usePacks] No signer available for gift claim");
        throw new Error("No signer available");
      }

      if (walletProvider !== "matchain_id") {
        console.error("[usePacks] Invalid wallet provider for gift claim:", walletProvider);
        throw new Error("Gift claiming is only available for Matchain ID users");
      }

      // Switch to Matchain network first
      await switchChain("matchain");

      console.log("[usePacks] Creating provider and contract instance");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PackGiftRedeemABI.abi,
        signer["matchain"]
      );

      console.log(signer["matchain"]);

      console.log("[usePacks] Calling redeemPack function");
      console.log("[usePacks] Contract address:", contract.address);
      const tx = await contract.redeemPack({ gasLimit: 1000000 });
      
      console.log("[usePacks] Waiting for transaction to be mined:", tx.hash);
      await tx.wait();

      console.log("[usePacks] Waiting for 10 seconds");
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log("[usePacks] Refreshing packs after successful claim");
      dispatch(fetchPacks(address));

      addToast({
        title: "Gift claimed",
        description: "Your gift has been claimed successfully",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } catch (error: any) {
      console.error("[usePacks] Error during gift claim:", error);
      addToast({
        title: "Claim failed",
        description: error.message ?? "Failed to claim gift",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      throw error;
    } finally {
      locks.claimGift = false;
    }
  };

  const getRedeemedPacks = async (): Promise<number> => {
    if (locks.getRedeemedPacks) {
      console.warn("[usePacks] getRedeemedPacks is already in progress");
      return 0;
    }

    locks.getRedeemedPacks = true;

    try {
      console.log("[usePacks] Getting redeemed packs count");
      if (!address) {
        console.error("[usePacks] No address available for getting redeemed packs");
        throw new Error("No address available");
      }

      if (!signer) {
        console.error("[usePacks] No signer available for getting redeemed packs");
        throw new Error("No signer available");
      }

      // Switch to Matchain network first
      await switchChain("matchain");

      console.log("[usePacks] Creating provider and contract instance");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PackGiftRedeemABI.abi,
        signer["matchain"]
      );

      console.log("[usePacks] Calling getRedeemedPacks function");
      const redeemedPacks = await contract.getRedeemedPacks(address);
      
      return Number(redeemedPacks);
    } catch (error: any) {
      console.error("[usePacks] Error getting redeemed packs:", error);
      throw error;
    } finally {
      locks.getRedeemedPacks = false;
    }
  };

  const getMaxRedeemablePacks = async (): Promise<number> => {
    if (locks.getMaxRedeemablePacks) {
      console.warn("[usePacks] getMaxRedeemablePacks is already in progress");
      return 0;
    }

    locks.getMaxRedeemablePacks = true;

    try {
      console.log("[usePacks] Getting max redeemable packs");
      if (!signer) {
        console.error("[usePacks] No signer available for getting max redeemable packs");
        throw new Error("No signer available");
      }

      // Switch to Matchain network first
      await switchChain("matchain");

      console.log("[usePacks] Creating provider and contract instance");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PackGiftRedeemABI.abi,
        signer["matchain"]
      );

      console.log("[usePacks] Calling maxPacksPerUser function");
      const maxPacks = await contract.maxPacksPerUser();
      
      return Number(maxPacks);
    } catch (error: any) {
      console.error("[usePacks] Error getting max redeemable packs:", error);
      throw error;
    } finally {
      locks.getMaxRedeemablePacks = false;
    }
  };

  return {
    claimGift,
    getRedeemedPacks,
    getMaxRedeemablePacks
  };
};
