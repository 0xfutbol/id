"use client";

import { usePacks } from "@/modules/pack/services";
import { Button, Modal, ModalBody, ModalContent, Spinner } from "@heroui/react";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { FiGift } from "react-icons/fi";
import { useEffectOnce } from "react-use";

export const ClaimGift = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [redeemedPacks, setRedeemedPacks] = useState<number>(0);
  const [maxRedeemablePacks, setMaxRedeemablePacks] = useState<number>(0);

  const { claimGift, getRedeemedPacks, getMaxRedeemablePacks } = usePacks();

  useEffectOnce(() => {
    const fetchInitialData = async () => {
      try {
        const [count, maxPacks] = await Promise.all([
          getRedeemedPacks(),
          getMaxRedeemablePacks()
        ]);
        setRedeemedPacks(count);
        setMaxRedeemablePacks(maxPacks);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  });

  const handleClaim = async () => {
    try {
      setIsLoading(true);
      await claimGift();
      
      // Trigger confetti animation
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Close modal after a short delay to show the confetti
      setTimeout(() => {
        setIsModalOpen(false);
        setIsLoading(false);
        // Refresh redeemed packs count after claiming
        getRedeemedPacks().then(setRedeemedPacks);
      }, 2000);
    } catch (error) {
      console.error("Failed to claim pack:", error);
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      handleClaim();
    }
  }, [isModalOpen]);

  // Only show button if no packs have been redeemed and initial loading is complete
  if (isInitialLoading || redeemedPacks >= maxRedeemablePacks) {
    return null;
  }

  return (
    <>
      <Button
        color="primary"
        className="text-black"
        startContent={<FiGift className="h-4 w-4" />}
        onClick={() => setIsModalOpen(true)}
      >
        Claim Gift
      </Button>

      <Modal 
        isOpen={isModalOpen} 
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        classNames={{
          backdrop: "bg-background/80 backdrop-blur-sm",
          base: "bg-background/80 backdrop-blur-sm",
        }}
        backdrop="blur"
        hideCloseButton
        onClose={() => setIsModalOpen(false)}
      >
        <ModalContent className="bg-transparent shadow-none">
          <ModalBody className="flex flex-col items-center justify-center py-8">
            {isLoading ? (
              <>
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-lg">Claiming your free pack...</p>
              </>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 