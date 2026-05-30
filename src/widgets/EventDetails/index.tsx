"use client";

import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import type { FC, ReactNode } from "react";

import type { PastEvent, FutureEvent } from "@/shared/api";
import { Text, Title } from "@/shared/ui/Typography";
import { useDotButton } from "@/shared/utils/useDotButton";
import { getImageUrl } from "@/shared/utils/getImageUrl";
import { ExpandableDescription } from "./components/ExpandableDescription";

type BaseEvent = Partial<PastEvent & FutureEvent>;

export type CarouselSlideProps = BaseEvent & {
  before?: ReactNode;
  after?: ReactNode;
  status?: string;
  details?: string[];
  color?: string;
};

interface CarouselProps {
  slides: CarouselSlideProps[];
  options?: EmblaOptionsType;
}

export const CarouselSkeleton: FC = () => {
  return (
    <div className="relative w-full h-[calc(100dvh-5rem)] bg-gray-900 animate-pulse">
      <div className="max-w-primary mx-auto h-full flex flex-col justify-end pb-20 px-6">
        <div className="h-10 w-1/3 bg-gray-800 rounded mb-6"></div>
        <div className="h-4 w-2/3 bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
};

const Carousel: FC<CarouselProps> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  return (
    <div className="relative w-full bg-black text-white h-[calc(100vh-5rem)]">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const eventColor = slide.color || "#3a7fff";
            const imageUrl = getImageUrl(slide.images?.[0]?.image);

            return (
              <div
                className="relative flex-grow-0 flex-shrink-0 basis-full min-w-0 h-full"
                key={slide.id || index}
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={imageUrl}
                    fill
                    className="object-cover"
                    alt={slide.name || "Event"}
                    priority={index === 0}
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${eventColor}E6 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)`,
                    }}
                  />
                </div>

                <div className="relative z-10 flex flex-col h-full max-w-primary mx-auto px-6 2xl:px-0 pb-24 sm:pb-32 pt-20 justify-end">
                  {slide.details && (
                    <div className="flex gap-4 mb-6">
                      {slide.details.map((detail, i) => (
                        <Text key={i} className="text-white/80">
                          {detail}
                        </Text>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-wrap items-center gap-6">
                      <Title className="text-white drop-shadow-lg !text-5xl sm:!text-7xl md:!text-8xl leading-[0.9]">
                        {slide.name}
                      </Title>

                      {slide.status && (
                        <span className="bg-lime-400 text-black px-4 py-2 rounded-full font-bold text-sm">
                          {slide.status}
                        </span>
                      )}
                    </div>

                    <ExpandableDescription text={slide.description} />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-8 mt-12">
                    <div className="flex-1">{slide.before}</div>
                    <div className="flex-1 flex justify-end items-center">
                      {slide.after}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-lg ${
                index === selectedIndex
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
