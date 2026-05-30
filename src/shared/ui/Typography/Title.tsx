import { cn } from "@/lib/utils";
import React from "react";

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: TitleLevel;
}

const styles: Record<TitleLevel, string> = {
  1: "clamp(calc(var(--text-4xl)*var(--dpr-ratio)), 5vw, var(--text-h8xl))",
  2: "clamp(calc(var(--text-3xl)*var(--dpr-ratio)), 5vw, calc(var(--text-6xl)*var(--dpr-ratio)))",
  3: "clamp(calc(var(--text-3xl)*var(--dpr-ratio)), 5vw, calc(var(--text-5xl)*var(--dpr-ratio)))",
  4: "clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, var(--text-h4xl))",
  5: "clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, calc(var(--text-4xl)*var(--dpr-ratio)))",
  6: "text-2xl",
};

export const Title: React.FC<TitleProps> = ({
  level = 1,
  children,
  className,
  ...props
}) => {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn("font-bold", className)}
      style={{ fontSize: styles[level] }}
      {...props}
    >
      {children}
    </Tag>
  );
};
