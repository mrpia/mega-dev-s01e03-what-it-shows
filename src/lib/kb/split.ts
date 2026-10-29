// #4471 split by problem instead of by subject. Counted the way the desk counts (CauseTable): every
// report under its tenant's cause from causes.ts. desk-notes.json lists the reports the desk read as a
// one-day move, which neither format bug explains: they get their own row and ticket, and stay counted
// under the cause they're filed in, so the rows add up to more than the ticket.
import notes from '#lib/data/desk-notes.json';
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemRow = {
  problem: string;
  reports: number;
  // How many of them intake tagged with this cause. A one-day move has no intake tag of its own.
  taggedRight: number | null;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For one-day moves: the cause row that also counts them.
  alsoIn: string | null;
};

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined, oneDayMove: readonly string[] = notes.oneDayMove) {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    taggedRight: g.taggedAs[g.cause] ?? 0,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    alsoIn: null,
  }));
  for (const g of groups) {
    const moved = g.reports.filter((r) => oneDayMove.includes(r.id));
    if (readAs(g, oneDayMove) === 0) continue;
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day',
      reports: moved.length,
      taggedRight: null,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      alsoIn: g.cause,
    });
  }
  return { rows, merged: merged.length, exported: all.length };
}
