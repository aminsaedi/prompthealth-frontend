import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IPro2Post, pro2Id, pro2PostImage, Pro2Service } from 'src/app/shared/services/pro2.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { copyText, downloadImage, fileNameFor, fullCaption } from '../studio-util';

/*
 * Every approved post, from every month, newest first: the place to come
 * back to for an image and its caption.
 */
@Component({
  selector: 'studio-library',
  templateUrl: './studio-library.component.html',
  styleUrls: ['./studio-library.component.scss'],
})
export class StudioLibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public view: 'loading' | 'ready' | 'failed' = 'loading';
  public posts: IPro2Post[] = [];
  public copiedId = '';
  public downloadingId = '';

  constructor(private _pro2: Pro2Service, private _uService: UniversalService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.view = 'loading';
    this._pro2.library().pipe(takeUntil(this.destroy$)).subscribe(res => {
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.posts) ? res.posts : []);
      this.posts = list.slice().sort((a, b) => this.approvedAt(b) - this.approvedAt(a));
      this.view = 'ready';
    }, () => this.view = 'failed');
  }

  private approvedAt(p: IPro2Post): number {
    const at = new Date((p.approval && p.approval.at) || p.updatedAt || p.createdAt || 0).getTime();
    return isNaN(at) ? 0 : at;
  }

  id(p: IPro2Post): string { return pro2Id(p); }
  image(p: IPro2Post): string { return pro2PostImage(p); }
  title(p: IPro2Post): string { return p.topicTitle || p.title || (p.content && p.content.headline) || 'Post'; }
  date(p: IPro2Post): string { return (p.approval && p.approval.at) || p.updatedAt || p.createdAt || ''; }

  download(p: IPro2Post): void {
    if (!this._uService.isBrowser || this.downloadingId) { return; }
    this.downloadingId = this.id(p);
    this.copy(p);
    downloadImage(this.image(p), fileNameFor(this.title(p), 'jpg')).then(() => this.downloadingId = '');
  }

  copy(p: IPro2Post): void {
    if (!this._uService.isBrowser) { return; }
    const id = this.id(p);
    copyText(fullCaption(p.caption, p.hashtags)).then(ok => {
      if (!ok) { return; }
      this.copiedId = id;
      setTimeout(() => { if (this.copiedId === id) { this.copiedId = ''; } }, 6000);
    });
  }

  trackById(_: number, p: IPro2Post): string { return pro2Id(p); }
}
