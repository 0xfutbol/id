/* eslint-disable no-console */
"use client";

import { API_CONFIG } from "@/config/api";
import { AirdropService, AllocationResponse } from "@/modules/airdrop";
import { useOxFutbolIdContext } from "@0xfutbol/id";
import { Alert, Button, Checkbox, Input, Modal, ModalBody, ModalContent, Tooltip } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { isAddress } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

const service = new AirdropService(API_CONFIG.backendUrl);

export function AirdropClaimBanner() {
  // Claiming window expires on Sep 10th, 2025 23:59:59 UTC.
  // Hide banner entirely after one month: Oct 10th, 2025 23:59:59 UTC.
  const claimDeadline = new Date(Date.UTC(2025, 8, 10, 23, 59, 59));
  const hideDeadline = new Date(Date.UTC(2025, 9, 10, 23, 59, 59));
  const now = new Date();
  const isClaimExpired = now > claimDeadline;
  if (now > hideDeadline) {
    return null;
  }

  const { defaultChain, signer } = useOxFutbolIdContext();

  const [allocations, setAllocations] = useState<AllocationResponse[]>([]);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationResponse | null>(null);
  const [checkbox, setCheckbox] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch all allocations
  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAllocations();
      setAllocations(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAllocations([]);
        // no allocation
      } else {
        console.error("Failed to fetch allocations", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const isAddressValid = useMemo(() => isAddress(destinationAddress), [destinationAddress]);
  const canClaim = checkbox && isAddressValid && selectedAllocation?.status === 'UNCLAIMED' && !!signer;

  const handleClaim = async () => {
    if (!selectedAllocation || !defaultChain || !signer) return;

    setClaiming(true);
    console.log("[AirdropClaimBanner] Starting claim process");
    try {
      // Ask user to sign message1
      console.log("[AirdropClaimBanner] Requesting signature for message:", selectedAllocation.message);
      const signature = await signer[defaultChain].signMessage(selectedAllocation.message!);
      console.log("[AirdropClaimBanner] Signature obtained:", signature);
      await service.claim({
        message: selectedAllocation.message!,
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
      await fetchAllocations();
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

  const renderContent = (allocation: AllocationResponse) => {
    switch (allocation.status) {
      case 'UNCLAIMED':
        return (
          <Alert color="success" className="flex items-center gap-4" endContent={
            isClaimExpired ? (
              <Tooltip content="Claiming window has expired on September 10th 23:59:59 UTC">
                <Button size="sm" color="success" isDisabled>
                  Claim
                </Button>
              </Tooltip>
            ) : (
              <Button size="sm" color="success" onPress={() => {
                setSelectedAllocation(allocation);
                setShowModal(true);
              }}>
                Claim
              </Button>
            )
          }>
            <span className="text-wrap">
              {allocation.discordUsername && (allocation.strategy === 'ZEALY' || allocation.strategy === 'ZEALY_II') ? (
                <>You have <b>{allocation.allocation} $FUTBOL</b> tokens ready to claim (Discord ID <b>{allocation.discordUsername}</b>)!</>
              ) : allocation.category ? (
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

  if (loading || allocations.length === 0) return null;

  return (
    <>
      {allocations.map((a, idx) => (
        <div key={idx}>{renderContent(a)}</div>
      ))}

      {selectedAllocation && selectedAllocation.status === 'UNCLAIMED' && (
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
              {isClaimExpired ? (
                <Tooltip content="Claiming window has expired on September 10th 23:59:59 UTC">
                  <Button
                    color="success"
                    isDisabled
                  >
                    Claim {selectedAllocation?.allocation} $FUTBOL
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  color="success"
                  isDisabled={!canClaim || claiming}
                  isLoading={claiming}
                  onPress={() => {
                    console.log("[AirdropClaimBanner] Claim modal button clicked");
                    handleClaim();
                  }}
                >
                  Claim {selectedAllocation?.allocation} $FUTBOL
                </Button>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
} 