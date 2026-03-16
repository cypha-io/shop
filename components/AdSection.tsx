'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlay } from 'react-icons/fi';

export default function AdSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
    },
    { 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80'
    },
    { 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80'
    },
    { 
      type: 'video', 
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'
    },
  ];

  useEffect(() => {
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
            key={index}
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
                src={slide.url}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/30"></div>
              
              {slide.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
                    <FiPlay className="text-4xl text-white ml-1" />
                  </div>
                </div>
              )}
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
