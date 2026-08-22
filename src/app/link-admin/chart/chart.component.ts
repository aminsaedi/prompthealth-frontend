import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

/* A canvas chart that is safe to put in a server-rendered page: Chart.js is
 * only ever constructed in the browser, and the server renders the caption that
 * stands in for it. The caption is not a fallback nobody sees — it is also what
 * a screen reader is given in place of the picture. */
@Component({
  selector: 'app-chart',
  template: `
    <div class="chart-frame" [style.height.px]="height">
      <canvas #canvas role="img" [attr.aria-label]="alt"></canvas>
    </div>
    <p class="chart-caption body-small text-label mb-0" *ngIf="caption">{{ caption }}</p>
  `,
  styles: [`
    .chart-frame { position: relative; width: 100%; }
    .chart-caption { margin-top: 10px; }
  `],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() config: ChartConfiguration = null;
  @Input() height = 240;
  @Input() alt = '';
  @Input() caption = '';

  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;

  private chart: Chart = null;
  private viewReady = false;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.draw();
  }

  ngOnChanges(): void {
    if (this.viewReady) { this.draw(); }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  /* Redrawing rather than mutating the existing chart: these charts change
   * shape as well as data — a report regrouped from days to hosts swaps the
   * axes — and an in-place update cannot express that. */
  private draw(): void {
    if (!this.isBrowser) { return; }
    this.destroyChart();
    if (!this.config) { return; }

    const canvas = this.canvasRef && this.canvasRef.nativeElement;
    if (!canvas) { return; }

    this.chart = new Chart(canvas, {
      ...this.config,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...(this.config.options || {}),
      },
    });
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
