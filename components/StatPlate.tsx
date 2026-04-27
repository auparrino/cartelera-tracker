import { ReactNode } from "react";

type Props = {
  numeral: string;
  label: string;
  value: ReactNode;
  context?: ReactNode;
  footnote?: string;
};

export default function StatPlate({ numeral, label, value, context, footnote }: Props) {
  return (
    <div className="vintage-card p-5 pl-6 relative">
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke/80">
          {label}
        </div>
        <div className="num-roman text-base">{numeral}</div>
      </div>
      <div className="font-display text-3xl sm:text-4xl text-ink leading-none mt-1">{value}</div>
      {context ? <div className="mt-3 font-serif italic text-sm text-smoke">{context}</div> : null}
      {footnote ? (
        <div className="mt-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ledger">
          {footnote}
        </div>
      ) : null}
    </div>
  );
}
