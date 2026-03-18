'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const normalizedImages = useMemo(() => {
    const unique = Array.from(new Set(images.map(url => url.trim()).filter(Boolean)));
    return unique.slice(0, 3);
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);

  if (normalizedImages.length === 0) {
    return <div className="h-80 bg-gray-100 md:h-[520px]" />;
  }

  const activeImage = normalizedImages[Math.min(activeIndex, normalizedImages.length - 1)]!;

  return (
    <div className="bg-gray-100 p-3 md:p-4">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-white md:h-[440px]">
        <Image src={activeImage} alt={productName} fill className="object-cover" priority />
      </div>

      {normalizedImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {normalizedImages.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 overflow-hidden rounded-lg border transition ${
                  isActive ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200 hover:border-orange-200'
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                <Image src={image} alt={`${productName} ${index + 1}`} fill className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
