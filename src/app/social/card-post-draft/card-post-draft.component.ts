import { Location } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs-compat/operator/first';
import { ISocialPost } from 'src/app/models/social-post';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { EditorService } from '../editor.service';

@Component({
  selector: 'card-post-draft',
  templateUrl: './card-post-draft.component.html',
  styleUrls: ['./card-post-draft.component.scss']
})
export class CardPostDraftComponent implements OnInit {

  @Input() post: ISocialPost;
  
  get linkToEditor() {
    const result = ['/community/editor'];
    result.push(this.post.isArticle ? 'article' : 'event');
    result.push(this.post._id);
    return result;
  }

  public descriptionSanitized: SafeHtml;

  @ViewChild('anchor') private anchor: ElementRef;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _editor: EditorService,
    private _location: Location,
    private _sanitizer: DomSanitizer,
  ) { }

  ngAfterViewInit() {
    this._route.fragment.subscribe(fragment => {
      if(fragment && fragment == this.post._id && this.anchor && this.anchor.nativeElement) {

        setTimeout(() => {
          const el: HTMLAnchorElement = this.anchor.nativeElement;
          const elTop = el.getBoundingClientRect().top;
          this._location.replaceState(this._location.path());
          smoothWindowScrollTo(elTop);
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.descriptionSanitized = this._sanitizer.bypassSecurityTrustHtml(this.post.description);
  }

  onClickCard() {
    this.markCurrentPosition();
    this._editor.setData(this.post.decode());
    this._router.navigate(this.linkToEditor);
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

}
