/* eslint-disable no-console */
"use client";

import { API_CONFIG } from "@/config/api";
import { AirdropService, AllocationResponse } from "@/modules/airdrop";
import { useOxFutbolIdContext } from "@0xfutbol/id";
import { Alert, Button, Checkbox, Input, Modal, ModalBody, ModalContent } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { isAddress } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

const service = new AirdropService(API_CONFIG.backendUrl);

export function AirdropClaimBanner() {
  const { defaultChain, signer } = useOxFutbolIdContext();

  const [allocation, setAllocation] = useState<AllocationResponse | null>(null);
  const [checkbox, setCheckbox] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Extracted fetchAllocation for reuse
  const fetchAllocation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAllocation();
      setAllocation(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAllocation(null);
        // no allocation
      } else {
        console.error("Failed to fetch allocation", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  const isAddressValid = useMemo(() => isAddress(destinationAddress), [destinationAddress]);
  const canClaim = checkbox && isAddressValid && allocation?.status === 'UNCLAIMED' && !!signer;

  const handleClaim = async () => {
    if (!allocation || !defaultChain || !signer) return;

    setClaiming(true);
    console.log("[AirdropClaimBanner] Starting claim process");
    try {
      // Ask user to sign message1
      console.log("[AirdropClaimBanner] Requesting signature for message:", allocation.message);
      const signature = await signer[defaultChain].signMessage(allocation.message!);
      console.log("[AirdropClaimBanner] Signature obtained:", signature);
      await service.claim({
        message: allocation.message!,
        signature,
        destinationAddress,
      });
      console.log("[AirdropClaimBanner] Claim successful");
      addToast({
        title: "Airdrop claimed!",
        color: "success",
        timeout: 3000,
      });
      setShowModal(false);
      // Refresh allocation status after successful claim
      await fetchAllocation();
    } catch (err: any) {
      console.error("[AirdropClaimBanner] Error claiming airdrop", err);
      addToast({
        title: "Claim failed",
        description: err.message ?? "Unexpected error",
        color: "danger",
        timeout: 4000,
      });
    } finally {
      setClaiming(false);
      console.log("[AirdropClaimBanner] Claiming set to false");
    }
  };

  const renderContent = () => {
    if (!allocation) return null;
    switch (allocation.status) {
      case 'UNCLAIMED':
        return (
          <Alert color="success" className="flex items-center gap-4" endContent={
            <Button size="sm" color="success" onPress={() => setShowModal(true)}>
              Claim
            </Button>
          }>
            <span className="text-wrap">
              {allocation.category ? (
                <>You have <b>{allocation.allocation} $FUTBOL</b> tokens ready to claim! Category: <b>{allocation.category}</b>. </>
              ) : (
                <>You have <b>{allocation.allocation} $FUTBOL</b> tokens ready to claim!</>
              )}
            </span>
          </Alert>
        );
      case 'PENDING':
        return (
          <Alert color="warning">
            Your claim is being processed. Come back later.
          </Alert>
        );
      case 'APPROVED':
        return (
          <Alert color="success" className="flex items-center gap-4" endContent={
            <Button as={"a" as any} href={allocation.claimUrl} target="_blank" color="success" size="sm">
              Redeem
            </Button>
          }>
            Your claim is approved. Click the 'Redeem' button to go to Sablier and redeem your tokens.
          </Alert>
        );
      default:
        return null;
    }
  };

  if (loading || !allocation) return null;

  return (
    <>
      {renderContent()}

      {allocation.status === 'UNCLAIMED' && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            if (!claiming) {
              console.log("[AirdropClaimBanner] Modal closed by user");
              setShowModal(false);
            }
          }}
          isDismissable={!claiming}
          isKeyboardDismissDisabled={claiming}
          backdrop="blur"
        >
          <ModalContent>
            <ModalBody className="flex flex-col gap-4 py-6">
              <p>
                Enter a self-custodial Ethereum address (we recommend MetaMask). Tokens will be sent here.
              </p>
              <Input
                placeholder="0x..."
                label="Destination address"
                value={destinationAddress}
                onValueChange={(val: string) => {
                  console.log("[AirdropClaimBanner] Destination address changed:", val);
                  setDestinationAddress(val);
                }}
                isInvalid={destinationAddress !== "" && !isAddressValid}
                errorMessage={!isAddressValid && destinationAddress !== "" ? "Invalid address" : undefined}
                isDisabled={claiming}
              />
              <Checkbox
                isSelected={checkbox}
                size="sm"
                onValueChange={(val: boolean) => {
                  console.log("[AirdropClaimBanner] Checkbox changed:", val);
                  setCheckbox(val);
                }}
                isDisabled={claiming}
              >
                I understand this must be a self-custodial wallet I control (e.g., MetaMask).
              </Checkbox>
              <Button
                color="success"
                isDisabled={!canClaim || claiming}
                isLoading={claiming}
                onPress={() => {
                  console.log("[AirdropClaimBanner] Claim modal button clicked");
                  handleClaim();
                }}
              >
                Claim {allocation?.allocation} $FUTBOL
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
} 