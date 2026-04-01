import { Injectable, Inject, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document
  ) {}

  setJsonLd(data: object | object[]): void {
    this.removeJsonLd();
    try {
      const renderer = this.rendererFactory.createRenderer(this.document, {
        id: '-1',
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {}
      });

      const script = renderer.createElement('script');
      renderer.setAttribute(script, 'type', 'application/ld+json');
      renderer.setAttribute(script, 'id', 'json-ld-schema');
      const text = renderer.createText(JSON.stringify(data));
      renderer.appendChild(script, text);
      renderer.appendChild(this.document.head, script);
    } catch (e) {
      console.error('Error within JsonLdService:', e);
    }
  }

  removeJsonLd(): void {
    const existing = this.document.getElementById('json-ld-schema');
    if (existing) {
      existing.remove();
    }
  }
}
