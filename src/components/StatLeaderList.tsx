import type { StatLeader } from "@/data/league";

export default function StatLeaderList({
  title,
  unit,
  leaders,
  accent = "teal",
}: {
  title: string;
  unit: string;
  leaders: StatLeader[];
  accent?: "teal" | "orange";
}) {
  const [leader, ...rest] = leaders;
  const accentClass = accent === "teal" ? "text-teal" : "text-orange";

  return (
    <div className="pl-card flex flex-col p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h3>
      {leader && (
        <div className="mt-3 flex items-baseline justify-between border-b border-border pb-3">
          <span className="font-semibold">{leader.name}</span>
          <span className={`text-2xl font-extrabold ${accentClass}`}>
            {leader.value}
            <span className="ml-1 text-xs font-medium text-muted">{unit}</span>
          </span>
        </div>
      )}
      <ul className="mt-2 flex flex-col divide-y divide-border">
        {rest.map((l) => (
          <li key={l.name} className="flex items-center justify-between py-2 text-sm">
            <span className="text-foreground/90">{l.name}</span>
            <span className="font-semibold text-muted">
              {l.value} {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
