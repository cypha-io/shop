'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type SliderProduct = {
  image?: string;
  imageUrls?: string[] | null;
};

const FALLBACK_SLIDES = [
  '/logo.png',
];

export default function AdSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>(FALLBACK_SLIDES);

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const response = await fetch('/api/products?limit=30', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const products = (await response.json()) as SliderProduct[];
        const cloudinaryUrls: string[] = [];

        for (const product of products) {
          const urls: string[] = [];

          if (Array.isArray(product.imageUrls)) {
            urls.push(...product.imageUrls);
          }

          if (product.image) {
            urls.push(product.image);
          }

          for (const rawUrl of urls) {
            const url = rawUrl?.trim();
            if (!url) continue;

            if (url.includes('res.cloudinary.com')) {
              if (!cloudinaryUrls.includes(url)) {
                cloudinaryUrls.push(url);
              }
            }
          }
        }

        const nextSlides = cloudinaryUrls.slice(0, 6);
        if (isMounted && nextSlides.length > 0) {
          setSlides(nextSlides);
          setCurrentSlide(0);
        }
      } catch {
        // Keep fallback slide if API fetch fails.
      }
    };

    void loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl h-[200px] md:h-[450px]">
        {slides.map((slide, index) => (
          <div
            key={`${slide}-${index}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
