"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { resolveAddressToUsername } from "@/store/features/profile";
import { useAppDispatch } from "@/store/hooks";

export default function AddressResolverPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const address = params.address as string;
  
  // Get current user context
  const { address: currentUserAddress, authStatus } = useOxFutbolIdContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is viewing their own profile by address
  const isViewingOwnProfile = useMemo(() => {
    if (authStatus !== "authenticated" || !currentUserAddress) return false;
    return currentUserAddress.toLowerCase() === address.toLowerCase();
  }, [authStatus, currentUserAddress, address]);

  // Redirect to /me if user is viewing their own profile
  useEffect(() => {
    if (isViewingOwnProfile) {
      router.replace('/me');
      return;
    }
  }, [isViewingOwnProfile, router]);

  useEffect(() => {
    if (!address || isViewingOwnProfile) return;

    dispatch(resolveAddressToUsername(address))
      .unwrap()
      .then((result) => {
        // Redirect to the username profile
        router.replace(`/u/${result.username}`);
      })
      .catch((err) => {
        setError(err.message || 'Failed to resolve address');
        setLoading(false);
      });
  }, [address, dispatch, router, isViewingOwnProfile]);

  if (isViewingOwnProfile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Redirecting to your profile...</div>
      </div>
    );
  }

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Resolving address...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-red-500">Error: {error}</div>
        <button 
          onClick={() => router.push('/me')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to My Profile
        </button>
      </div>
    );
  }

  return null;
} 