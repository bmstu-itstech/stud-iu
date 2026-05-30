import type { FC } from "react";

export const NewsCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full xl:max-w-300 2xl:max-w-350 mx-auto lg:mx-0 animate-pulse">
      <div className="bg-gray-200 rounded-3xl w-full h-48 sm:h-64 xl:h-44 2xl:h-48"></div>
      <div className="flex justify-between items-center px-1">
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/5"></div>
      </div>
      <div className="space-y-2 px-1">
        <div className="h-6 bg-gray-300 rounded w-full"></div>
        <div className="h-6 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default NewsCardSkeleton;
