import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import type { StandingsRow } from "@/lib/sofascore";

export default function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <div className="pl-card overflow-x-auto p-4">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">Takım</th>
            <th className="px-2 py-2 text-center font-medium">O</th>
            <th className="px-2 py-2 text-center font-medium">G</th>
            <th className="px-2 py-2 text-center font-medium">B</th>
            <th className="px-2 py-2 text-center font-medium">M</th>
            <th className="px-2 py-2 text-center font-medium">AV</th>
            <th className="py-2 pl-2 text-right font-medium">P</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0">
              <td className="py-2.5 pr-2 font-semibold text-muted">{r.position}</td>
              <td className="py-2.5 pr-2">
                <Link
                  href={`/takimlar/${r.team.id}`}
                  className="flex items-center gap-2 font-medium transition-colors hover:text-accent"
                >
                  <TeamLogo teamId={r.team.id} name={r.team.name} size={22} />
                  <span className="whitespace-nowrap">{r.team.name}</span>
                </Link>
              </td>
              <td className="px-2 py-2.5 text-center text-muted">{r.matches}</td>
              <td className="px-2 py-2.5 text-center text-muted">{r.wins}</td>
              <td className="px-2 py-2.5 text-center text-muted">{r.draws}</td>
              <td className="px-2 py-2.5 text-center text-muted">{r.losses}</td>
              <td className="px-2 py-2.5 text-center text-muted">
                {r.scoresFor}-{r.scoresAgainst}
              </td>
              <td className="py-2.5 pl-2 text-right font-bold text-accent">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
