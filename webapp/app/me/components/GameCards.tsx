import { getImgUrl } from "@/utils/getImgUrl";
import { Card, CardFooter, Chip, Image as NextImage } from "@heroui/react";
import { GameCardProps } from "../types";

interface GameCardsProps {
  cards: GameCardProps[];
}

export function GameCards({ cards }: GameCardsProps) {
  return (
    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card 
          key={card.title} 
          isFooterBlurred 
          isPressable 
          className="aspect-video" 
          onClick={() => window.open(card.url, "_blank")}
        >
          <NextImage 
            removeWrapper 
            alt={card.title} 
            className="z-0 w-full h-full object-cover" 
            src={getImgUrl(card.image)} 
          />
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-100 gap-1">
            <div className="flex flex-grow gap-2 items-start">
              <div className="flex flex-col text-left">
                <p className="text-tiny text-white">{card.title}</p>
                <p className="text-tiny text-white/60">{card.description}</p>
              </div>
            </div>
            <Chip color="success" size="sm">{card.buttonText}</Chip>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 