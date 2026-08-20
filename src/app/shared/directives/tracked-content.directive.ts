import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TrackedLinkService } from '../services/tracked-link.service';
import { UniversalService } from '../services/universal.service';

/* Rewrites external <a href> links INSIDE dynamically-bound rich-text ([innerHTML])
 * containers to /out/<code>, so inline links in article/event/notification bodies get
 * UTM + click tracking too. Browser-only (SSR-safe: leaves SSR HTML unchanged). Uses a
 * MutationObserver (subtree childList) so it catches content that binds after init.
 * Setting href is an attribute mutation, which a childList observer does NOT fire on,
 * so the directive never self-triggers a re-scan loop. */
@Directive({ selector: '[trackedContent]' })
export class TrackedContentDirective implements OnInit, OnDestroy {
  private observer: MutationObserver | null = null;
  private processing = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private tracked: TrackedLinkService,
    private uService: UniversalService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    if (!this.uService.isBrowser) {
      return; // SSR: leave innerHTML as-is; client upgrades links
    }
    this.ngZone.runOutsideAngular(() => {
      this.rewrite();
      this.observer = new MutationObserver(() => this.rewrite());
      this.observer.observe(this.el.nativeElement, { childList: true, subtree: true });
    });
  }

  private rewrite(): void {
    const root = this.el.nativeElement;
    if (!root) return;
    const anchors = root.querySelectorAll('a[href]');
    for (const a of Array.from(anchors)) {
      try {
        const href = a.getAttribute('href') || '';
        if (!href) continue;
        // Only ever touch real web links; never javascript:/data:/vbscript:/# anchors.
        if (href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('vbscript:') || href.startsWith('#')) continue;
        if (!this.tracked.isExternal(href)) continue;
        if (this.processing.has(href)) continue; // avoid re-resolving same URL in this pass
        this.processing.add(href);
        this.tracked.trackedHref(href, 'ARTICLE')
          .pipe(takeUntil(this.destroy$))
          .subscribe((trackedHref) => {
            if (trackedHref && trackedHref !== href) {
              a.setAttribute('href', trackedHref);
            }
            this.processing.delete(href);
          }, () => this.processing.delete(href));
      } catch (e) {
        // never break content rendering on a tracking issue
      }
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
