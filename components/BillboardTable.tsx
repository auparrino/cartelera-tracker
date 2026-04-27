type Row = {
  rank: number | string;
  title: string;
  meta?: string;
  right?: string;
  rightSub?: string;
  highlight?: boolean;
};

export default function BillboardTable({
  caption,
  rows,
  rightLabel,
}: {
  caption?: string;
  rows: Row[];
  rightLabel?: string;
}) {
  return (
    <div className="vintage-card">
      {caption ? (
        <div className="px-5 pt-4 pb-2 border-b border-ink/40 flex items-baseline justify-between">
          <div className="font-deco tracking-deco uppercase text-[0.7rem] text-smoke">
            {caption}
          </div>
          {rightLabel ? (
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ledger">
              {rightLabel}
            </div>
          ) : null}
        </div>
      ) : null}
      <ol className="divide-y divide-ink/15">
        {rows.map((r, i) => (
          <li
            key={`${r.rank}-${r.title}-${i}`}
            className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${
              r.highlight ? "bg-gilt/10" : ""
            }`}
          >
            <span className="num-roman text-lg w-8 text-right">
              {typeof r.rank === "number" ? r.rank.toString().padStart(2, "0") : r.rank}
            </span>
            <span className="text-brass text-xl leading-none">·</span>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-base sm:text-lg leading-tight text-ink truncate">
                {r.title}
              </div>
              {r.meta ? (
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-smoke/70 mt-0.5 truncate">
                  {r.meta}
                </div>
              ) : null}
            </div>
            {r.right ? (
              <div className="text-right shrink-0">
                <div className="font-display text-base text-ink">{r.right}</div>
                {r.rightSub ? (
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
                    {r.rightSub}
                  </div>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
