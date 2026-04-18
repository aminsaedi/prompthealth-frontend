import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {

  private isFirstBrowserLoad = true;

  constructor(
    @Inject(DOCUMENT) private doc: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  setJsonLd(data: object | object[]): void {
    if (isPlatformBrowser(this.platformId)) {
      const existing = this.doc.getElementById('json-ld-schema');
      if (existing && this.isFirstBrowserLoad) {
        // SSR already injected the schema — skip to avoid duplicates
        this.isFirstBrowserLoad = false;
        return;
      }
      this.isFirstBrowserLoad = false;
    }

    // Server-side OR client-side SPA navigation: remove old and inject new
    this.removeJsonLd();
    try {
      const head = this.doc.head || this.doc.getElementsByTagName('head')[0];
      if (!head) return;

      const script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'json-ld-schema');
      script.textContent = JSON.stringify(data);
      head.appendChild(script);
    } catch (e) {
      console.error('Error within JsonLdService:', e);
    }
  }

  removeJsonLd(): void {
    try {
      const existing = this.doc.querySelectorAll('script[type="application/ld+json"]');
      existing.forEach((el: any) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    } catch (e) {
      // ignore
    }
  }
}
