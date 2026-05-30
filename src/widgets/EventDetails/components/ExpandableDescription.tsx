"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Text, Title } from "@/shared/ui/Typography";

interface Props {
  text?: string | null;
}

export const ExpandableDescription = ({ text }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!text) return null;

  const isLongText = text.length > 250;

  return (
    <>
      <div className="flex flex-col items-start gap-2 max-w-6xl transition-all duration-300">
        <Text
          level={2}
          className={cn(
            "text-gray-200 drop-shadow-md leading-snug opacity-90 transition-all",
            isLongText ? "line-clamp-4" : "",
          )}
        >
          {text}
        </Text>

        {isLongText && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-400 hover:text-blue-300 font-bold text-3xl uppercase tracking-wider transition-colors focus:outline-none border-b border-transparent hover:border-blue-300 pb-0.5"
          >
            Подробнее...
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-[90dvw] max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <Title level={3} className="text-gray-900">
                Описание события
              </Title>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
              <Text
                level={3}
                className="text-gray-700 whitespace-pre-wrap leading-relaxed"
              >
                {text}
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
