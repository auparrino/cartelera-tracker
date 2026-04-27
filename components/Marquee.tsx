import { ReactNode } from "react";

export default function Marquee({
  pre,
  post,
  children,
}: {
  pre?: string;
  post?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative my-6 sm:my-10">
      <div className="bg-ink text-ivory border-y-2 border-brass py-4 px-4 sm:px-8 text-center">
        <div className="bg-deco-rays-fixed absolute inset-0 opacity-10" aria-hidden />
        <div className="relative">
          {pre ? (
            <div className="font-deco tracking-deco uppercase text-[0.62rem] sm:text-[0.7rem] text-brass mb-1">
              {pre}
            </div>
          ) : null}
          <div className="font-display text-[clamp(1.3rem,3vw,2rem)] tracking-marquee">{children}</div>
          {post ? (
            <div className="font-deco tracking-deco uppercase text-[0.62rem] sm:text-[0.7rem] text-brass mt-1">
              {post}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
