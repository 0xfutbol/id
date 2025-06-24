import { Avatar, Card, CardBody } from "@heroui/react";

interface ProfileHeaderProps {
  username: string | undefined;
  address: string | null;
  discordAccount: string | null;
  avatarSrc: string | undefined;
  isViewingOtherUser?: boolean;
}

export function ProfileHeader({
  username,
  address,
  discordAccount,
  avatarSrc,
  isViewingOtherUser = false
}: ProfileHeaderProps) {
  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center">
            <Avatar 
              className="mr-4" 
              size="lg" 
              src={avatarSrc || `https://effigy.im/a/${address}.png`} 
            />
            <div>
              <h2 className="text-xl font-bold">{username || "Anonymous"}</h2>
              <p className="text-gray-500 text-sm">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No address"}
              </p>
              {discordAccount && (
                <p className="text-blue-500 text-sm">
                  Discord: {discordAccount}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 