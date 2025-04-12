import { Card, CardFooter, CardHeader, Image } from "@nextui-org/react";
import React, { ReactElement } from "react";

type GalleryCardProps = {
  alt: string;
  src: string | ReactElement;
  title: string | ReactElement;
  headerComponent?: ReactElement;
};

export const GalleryCard: React.FC<GalleryCardProps> = ({ alt, src, title, headerComponent }) => (
  <Card isFooterBlurred className="aspect-square col-span-12 sm:col-span-5 w-full">
    {headerComponent && (
      <CardHeader className="absolute flex-col justify-center items-stretch p-2 w-full z-10">
        {headerComponent}
      </CardHeader>
    )}
    {typeof src === "string" ? (
      <Image removeWrapper alt={alt} className="h-full object-cover w-full z-0" src={src} />
    ) : (
      <div className="h-full object-cover w-full z-0">{src}</div>
    )}
    <CardFooter className="absolute before:bg-white/10 before:rounded-xl border-1 border-white/20 bottom-2 justify-center ml-2 overflow-hidden py-1 rounded-large shadow-small w-[calc(100%_-_16px)] z-10">
      <p className="text-tiny text-white/80">{title}</p>
    </CardFooter>
  </Card>
);
