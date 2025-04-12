type GalleryProps<T> = {
  emptyStateMessage?: string;
  items: T[];
  renderItem: (item: T) => JSX.Element;
};

export function Gallery<T>({ items, emptyStateMessage = "No items to display", renderItem }: GalleryProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
