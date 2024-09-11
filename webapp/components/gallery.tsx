import { Card, CardBody } from "@nextui-org/react";

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
};

type GalleryProps<T extends GalleryItem> = {
  items: T[];
  renderItem?: (item: T) => JSX.Element;
};

const defaultRenderItem = (item: GalleryItem) => (
  <Card>
    <CardBody>
      <img
        src={item.src}
        alt={item.alt}
        className="w-full h-48 object-cover"
      />
      <p className="text-center mt-2">{item.title}</p>
    </CardBody>
  </Card>
);

export function Gallery<T extends GalleryItem>({ items, renderItem = defaultRenderItem }: GalleryProps<T>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
}