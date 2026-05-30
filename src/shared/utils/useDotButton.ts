"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type EmblaApiType = UseEmblaCarouselType[1];

export const useDotButton = (emblaApi: EmblaApiType | undefined) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onInit = useCallback((api: EmblaApiType) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: EmblaApiType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};

export default useDotButton;
