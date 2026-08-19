import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { TrackedLinkService } from '../services/tracked-link.service';
import { UniversalService } from '../services/universal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Upgrades external anchors to tracked /out/<code> links in the browser.
 * Server-rendered HTML keeps the raw href (no SSR latency); client-side JS then
 * swaps to the tracked URL so real-user clicks get counted. */
@Directive({ selector: '[appTrackedLink]' })
export class TrackedLinkDirective implements OnInit, OnDestroy {
  @Input('appTrackedLink') slugType: string | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLAnchorElement>,
    private tracked: TrackedLinkService,
    private uService: UniversalService,
  ) {}

  ngOnInit(): void {
    if (!this.uService.isBrowser) {
      return; // SSR: keep raw href, avoid server round-trip
    }
    const anchor = this.el.nativeElement;
    const href = anchor.getAttribute('href') || '';
    if (!this.tracked.isExternal(href)) {
      return;
    }
    this.tracked.trackedHref(href, this.slugType)
      .pipe(takeUntil(this.destroy$))
      .subscribe((trackedHref) => {
        if (trackedHref && trackedHref !== href) {
          anchor.setAttribute('href', trackedHref);
        }
      }, () => {
        // leave original href on error; never break navigation
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
