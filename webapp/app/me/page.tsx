"use client";

import { Gallery, GalleryItem } from "@/components/gallery";
import { useMsIdContext } from "@/modules/msid/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";
import { Avatar, Button, Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const achievements: GalleryItem[] = [
  { src: "https://picsum.photos/seed/achievement1/300/200", alt: "Achievement 1", title: "Achievement 1" },
  { src: "https://picsum.photos/seed/achievement2/300/200", alt: "Achievement 2", title: "Achievement 2" },
  { src: "https://picsum.photos/seed/achievement3/300/200", alt: "Achievement 3", title: "Achievement 3" },
  { src: "https://picsum.photos/seed/achievement4/300/200", alt: "Achievement 4", title: "Achievement 4" },
  { src: "https://picsum.photos/seed/achievement5/300/200", alt: "Achievement 5", title: "Achievement 5" },
  { src: "https://picsum.photos/seed/achievement6/300/200", alt: "Achievement 6", title: "Achievement 6" },
];

const clubs: GalleryItem[] = [
  { src: "https://picsum.photos/seed/club1/200/200", alt: "Club 1", title: "Club 1" },
  { src: "https://picsum.photos/seed/club2/200/200", alt: "Club 2", title: "Club 2" },
  { src: "https://picsum.photos/seed/club3/200/200", alt: "Club 3", title: "Club 3" },
  { src: "https://picsum.photos/seed/club4/200/200", alt: "Club 4", title: "Club 4" },
];

const lands: GalleryItem[] = [
  { src: "https://picsum.photos/seed/land1/300/200", alt: "Land 1", title: "Land 1" },
  { src: "https://picsum.photos/seed/land2/300/200", alt: "Land 2", title: "Land 2" },
  { src: "https://picsum.photos/seed/land3/300/200", alt: "Land 3", title: "Land 3" },
  { src: "https://picsum.photos/seed/land4/300/200", alt: "Land 4", title: "Land 4" },
];

const players: GalleryItem[] = [
  { src: "https://picsum.photos/seed/player1/200/300", alt: "Player 1", title: "Player 1" },
  { src: "https://picsum.photos/seed/player2/200/300", alt: "Player 2", title: "Player 2" },
  { src: "https://picsum.photos/seed/player3/200/300", alt: "Player 3", title: "Player 3" },
  { src: "https://picsum.photos/seed/player4/200/300", alt: "Player 4", title: "Player 4" },
  { src: "https://picsum.photos/seed/player5/200/300", alt: "Player 5", title: "Player 5" },
  { src: "https://picsum.photos/seed/player6/200/300", alt: "Player 6", title: "Player 6" },
  { src: "https://picsum.photos/seed/player7/200/300", alt: "Player 7", title: "Player 7" },
  { src: "https://picsum.photos/seed/player8/200/300", alt: "Player 8", title: "Player 8" },
];

const scouts: GalleryItem[] = [
  { src: "https://picsum.photos/seed/scout1/250/250", alt: "Scout 1", title: "Scout 1" },
  { src: "https://picsum.photos/seed/scout2/250/250", alt: "Scout 2", title: "Scout 2" },
  { src: "https://picsum.photos/seed/scout3/250/250", alt: "Scout 3", title: "Scout 3" },
  { src: "https://picsum.photos/seed/scout4/250/250", alt: "Scout 4", title: "Scout 4" },
  { src: "https://picsum.photos/seed/scout5/250/250", alt: "Scout 5", title: "Scout 5" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isClaimPending, username } = useMsIdContext();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // This is a placeholder. In a real application, you'd fetch this from your user state or API
  const discordAccount = null; // Change to a string value to simulate a connected account

  const handleConnectDiscord = () => {
    // Implement Discord connection logic here
    console.log("Connecting to Discord...");
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-8 w-full">
      <Card className="w-full">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar 
                src={getImgUrl("https://img.metasoccer.com/avatar.jpg", { size: 128 })} 
                size="lg" 
                className="mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold">John Doe</h2>
                <p className="text-gray-500">{username}<span className="text-gray-400">.ms</span></p>
              </div>
            </div>
            <div className="flex items-center">
              {discordAccount ? (
                <>
                  <Image src="/discord-icon.svg" alt="Discord" width={24} height={24} className="mr-2" />
                  <p><strong>Discord:</strong> {discordAccount}</p>
                </>
              ) : (
                <Button 
                  color="primary" 
                  onClick={handleConnectDiscord}
                  startContent={<Image src="/discord-icon.svg" alt="Discord" width={24} height={24} />}
                >
                  Connect Discord
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="w-full flex-grow">
        <Tabs aria-label="Profile tabs" className="w-full">
          <Tab key="achievements" title="Achievements">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Achievements</h3>
              <Gallery items={achievements} />
            </div>
          </Tab>
          <Tab key="clubs" title="Clubs">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Clubs</h3>
              <Gallery items={clubs} />
            </div>
          </Tab>
          <Tab key="lands" title="Lands">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Lands</h3>
              <Gallery items={lands} />
            </div>
          </Tab>
          <Tab key="players" title="Players">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Players</h3>
              <Gallery items={players} />
            </div>
          </Tab>
          <Tab key="scouts" title="Scouts">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">Scouts</h3>
              <Gallery items={scouts} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
