import { LinkHealthStatus } from 'src/app/shared/services/link-manager.service';

/* One place decides what a destination status is called and how loudly it is
 * shown. The catalog filter, the ribbon, the table and the attention list all
 * read from here, so a status can never be green in one panel and red in
 * another. */
export type HealthTone = 'good' | 'info' | 'warn' | 'bad' | 'idle';

export interface IHealthMeta {
  status: LinkHealthStatus;
  /* What an operator calls it, not what the checker returns. */
  label: string;
  tone: HealthTone;
  /* Shown under the ribbon so the colour is never the only carrier. */
  hint: string;
}

/* Ordered worst-first: the ribbon and the legend both read in this order, so
 * the segments that need action sit at the start rather than wherever the
 * aggregation happened to put them. */
export const HEALTH_META: IHealthMeta[] = [
  { status: 'BROKEN', label: 'Dead', tone: 'bad', hint: 'The page is gone. Traffic sent here is lost.' },
  { status: 'UNREACHABLE', label: 'Unreachable', tone: 'bad', hint: 'The site did not answer. It may be down or gone.' },
  { status: 'BLOCKED', label: 'Blocked us', tone: 'warn', hint: 'The site refused our check. Visitors are probably fine.' },
  { status: 'REDIRECT', label: 'Redirecting', tone: 'info', hint: 'The link lands somewhere else. Usually harmless.' },
  { status: 'OK', label: 'Working', tone: 'good', hint: 'Checked and answering normally.' },
  { status: 'UNKNOWN', label: 'Not checked', tone: 'idle', hint: 'Waiting its turn in the hourly check.' },
];

const BY_STATUS: { [key: string]: IHealthMeta } = HEALTH_META.reduce((acc, meta) => {
  acc[meta.status] = meta;
  return acc;
}, {} as { [key: string]: IHealthMeta });

export const healthMeta = (status: string): IHealthMeta =>
  BY_STATUS[(status || 'UNKNOWN').toUpperCase()] || BY_STATUS.UNKNOWN;
