import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const getImageUrl = (id: string): string => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  // Return a default placeholder if not found, to avoid breaking the UI
  return image ? image.imageUrl : `https://picsum.photos/seed/${id}/600/400`;
};
