import { Link, Snippet, Spacer } from "@heroui/react";

interface TokenVestingBannerProps {
  tokenVestingBalance: string;
  msuBalance: string;
}

export function TokenVestingBanner({ 
  tokenVestingBalance, 
  msuBalance
}: TokenVestingBannerProps) {
  // Hide after September 10th, 2025 23:59:59 UTC
  const cutoff = new Date(Date.UTC(2025, 8, 10, 23, 59, 59));
  if (new Date() > cutoff) {
    return null;
  }

  if (!tokenVestingBalance || Number(tokenVestingBalance) <= 0) {
    return null;
  }

  const futbolAmount = Math.round((parseFloat(msuBalance) * 0.001925) / 0.03);

  return (
    <Snippet hideCopyButton hideSymbol color="success" size="md">
      <span className="text-wrap">
        You're eligible to claim <b>{futbolAmount} $FUTBOL</b> tokens based on your MSU balance!
      </span>
      <Spacer y={1} />
      <span className="text-wrap">
        Visit{' '}
        <Link 
          className="text-[#00ff00]" 
          href="https://app.hedgey.finance/vesting" 
          size="sm" 
          target="_blank"
        >
          hedgey.finance
        </Link>{' '}
        and connect your wallet to claim your tokens. Have questions? Join our{' '}
        <Link 
          className="text-[#00ff00]" 
          href="https://0xfutbol.com/discord" 
          size="sm" 
          target="_blank"
        >
          community
        </Link>{' '}
        for support!
      </span>
    </Snippet>
  );
} 