import { ReactNode } from "react";

type Props = {
  number: string; // e.g. "I", "II"
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ number, kicker, title, subtitle, children }: Props) {
  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-baseline gap-4 sm:gap-6 border-b border-ink pb-4">
        <span className="num-roman text-3xl sm:text-5xl font-deco">{number}</span>
        <div className="min-w-0">
          {kicker ? (
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-smoke/80">
              {kicker}
            </div>
          ) : null}
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.8rem)] leading-tight text-ink">
            {title}
          </h2>
          {subtitle ? (
            <p className="font-serif italic text-smoke text-base sm:text-lg mt-1">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
