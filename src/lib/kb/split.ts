// #4471 split by problem instead of by subject. causes.ts tells parser from hint; desk-notes.json lists
// the reports the desk read as a one-day move, which neither format bug explains. Each problem gets its
// own ticket, so here a one-day move counts as itself, not under its tenant's cause.
import notes from '#lib/data/desk-notes.json';
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[] = notes.oneDayMove): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  // How many of them intake tagged with the right cause. A one-day move has no intake tag of its own.
  taggedRight: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined) {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemRow['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const rows: ProblemRow[] = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs.length,
        taggedRight: rs.filter((r) => r.meta.intakeTag === problem).length,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports - a.reports);
  return { rows, merged: merged.length, exported: all.length };
}
