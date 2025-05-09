import { Avatar, Button, Card, CardBody } from "@heroui/react";
import { SiDiscord } from "react-icons/si";

interface ProfileHeaderProps {
  username: string | undefined;
  address: string | null;
  discordAccount: string | null;
  avatarSrc: string | undefined;
  onConnectDiscord: () => void;
}

export function ProfileHeader({
  username,
  address,
  discordAccount,
  avatarSrc,
  onConnectDiscord
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
              <p className="text-gray-400">
                {username}<span className="text-gray-500">.0xfutbol</span>
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {discordAccount ? (
              <div className="flex items-center gap-2">
                <SiDiscord size={24} />
                <p>{discordAccount}</p>
              </div>
            ) : (
              <Button 
                color="primary" 
                startContent={<SiDiscord size={24} />} 
                onClick={onConnectDiscord}
              >
                Connect Discord
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 