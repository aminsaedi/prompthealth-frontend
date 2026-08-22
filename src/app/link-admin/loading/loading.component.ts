import { Component, Input } from '@angular/core';

export type LoadingVariant = 'inline' | 'kpis' | 'chart' | 'list' | 'grid' | 'form';

/* One way for the whole section to say "working". A skeleton stands in for the
 * shape that is coming, so the page does not grow under the reader's eyes when
 * the data lands, and no panel ever shows a real-looking zero it does not know
 * yet. The inline variant is for a refresh next to content already on screen.
 *
 * Only the placeholder carrying a label announces itself; the rest are scenery
 * and are hidden from assistive technology, so a page of six skeletons is one
 * polite "Loading the overview…" rather than six. */
@Component({
  selector: 'app-la-loading',
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  @Input() variant: LoadingVariant = 'inline';

  /* Empty means this placeholder is decorative. */
  @Input() label = '';

  /* How many rows of scenery to draw. Matched to what the real panel holds so
   * the swap is a fill rather than a jump. */
  @Input() rows = 5;

  get lines(): number[] {
    const count = Math.max(1, Math.min(12, this.rows));
    const out: number[] = [];
    for (let i = 0; i < count; i++) { out.push(i); }
    return out;
  }

  /* Uneven widths read as text waiting to arrive; four identical bars read as a
   * broken table. The sequence is fixed so it never reshuffles on a redraw. */
  width(index: number): string {
    return WIDTHS[index % WIDTHS.length];
  }

  readonly four = [0, 1, 2, 3];
}

const WIDTHS = ['92%', '68%', '84%', '55%', '76%', '63%'];
