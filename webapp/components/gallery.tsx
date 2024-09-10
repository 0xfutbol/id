import { Card, CardBody } from "@nextui-org/react";

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
};

export const Gallery = ({ items }: { items: GalleryItem[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {items.map((item, index) => (
      <Card key={index}>
        <CardBody>
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-48 object-cover"
          />
          <p className="text-center mt-2">{item.title}</p>
        </CardBody>
      </Card>
    ))}
  </div>
);