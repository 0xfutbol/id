import { getSquidByChain } from "@/modules/squid/utils";
import { fetchPacks } from "@/store/features/profile";
import { useAppDispatch } from "@/store/hooks";
import { ChainName } from "@0xfutbol/constants";
import { useOxFutbolIdContext } from "@0xfutbol/id";
import { addToast } from "@heroui/toast";
import { ethers } from "ethers";
import PackGiftRedeemABI from "../abis/PackGiftRedeem.json";

const CONTRACT_ADDRESS = "0x385F843A89e7835b99D8016f3C3feD6FfED96759";

export const usePacks = () => {
  const dispatch = useAppDispatch();
  const { address, signer, walletProvider, switchChain } = useOxFutbolIdContext();

  const claimGift = async (): Promise<void> => {
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

    try {
      // Switch to Matchain network first
      await switchChain("matchain");

      console.log("[usePacks] Creating provider and contract instance");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PackGiftRedeemABI.abi,
        signer["matchain"]
      );

      console.log("[usePacks] Calling redeemPack function");
      const tx = await contract.redeemPack();
      
      console.log("[usePacks] Waiting for transaction to be mined:", tx.hash);
      await tx.wait();
      
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
    }
  };

  const getPacks = async (chain: ChainName) => {
    console.log("[usePacks] Getting packs for chain:", chain);
    if (!address) {
      console.error("[usePacks] No address available for getting packs");
      throw new Error("No address available");
    }

    const service = getSquidByChain(chain);
    console.log("[usePacks] Querying packs for address:", address);
    return service.queryPacks(address);
  };

  const getRedeemedPacks = async (): Promise<number> => {
    console.log("[usePacks] Getting redeemed packs count");
    if (!address) {
      console.error("[usePacks] No address available for getting redeemed packs");
      throw new Error("No address available");
    }

    if (!signer) {
      console.error("[usePacks] No signer available for getting redeemed packs");
      throw new Error("No signer available");
    }

    try {
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
    }
  };

  return {
    claimGift,
    getPacks,
    getRedeemedPacks
  };
};
