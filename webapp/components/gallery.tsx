type GalleryProps<T> = {
  items: T[];
  renderItem: (item: T) => JSX.Element;
};

export function Gallery<T>({ items, renderItem }: GalleryProps<T>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
}