<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { splitTicket } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // issues: problem → ticket number in `repo`, where each problem is filed.
  let { ticket, repo, issues }: { ticket: number; repo: string; issues: Record<string, number> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf));
  const LABEL: Record<string, string> = {
    parser: 'shared parser reads dates month first',
    hint: 'booking-v3 hint says MM/DD, form reads DD/MM',
    'one-day': 'date moves one day back (time zone)',
    unplaced: 'no day-first tenant on file',
  };
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports in #{ticket} ({split.exported} rows in the export, duplicates dropped) ·
  <strong>{split.rows.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tag right</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code> {LABEL[r.problem]}</td>
        <td>{r.reports}{#if r.alsoIn}<br /><small>also in <code>{r.alsoIn}</code></small>{/if}</td>
        <td>{r.taggedRight ?? '—'}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>
          {#if issues[r.problem]}<a href="https://github.com/{repo}/issues/{issues[r.problem]}">{repo}#{issues[r.problem]}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
