import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  setJsonLd(data: object | object[]): void {
    this.removeJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-schema';
    script.text = JSON.stringify(Array.isArray(data) ? data : data);
    this.document.head.appendChild(script);
  }

  removeJsonLd(): void {
    const existing = this.document.getElementById('json-ld-schema');
    if (existing) {
      existing.remove();
    }
  }
}
