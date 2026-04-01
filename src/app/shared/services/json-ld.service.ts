import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {

  constructor(@Inject(DOCUMENT) private doc: any) {}

  setJsonLd(data: object | object[]): void {
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
      const existing = this.doc.getElementById('json-ld-schema');
      if (existing) {
        existing.parentNode.removeChild(existing);
      }
    } catch (e) {
      // ignore
    }
  }
}
