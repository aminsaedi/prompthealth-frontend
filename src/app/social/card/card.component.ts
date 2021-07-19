import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';
import { CardItemToolbarComponent } from '../card-item-toolbar/card-item-toolbar.component';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() post: SocialPost;
  @Input() shorten: boolean = true;

  public isContentGradientShown: boolean = false;

  @ViewChild('toolbar') private toolbar: CardItemToolbarComponent;
  @ViewChild('content') private content: ElementRef;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    const el = this.content.nativeElement as HTMLDivElement;
    this.isContentGradientShown = (el.clientHeight >= 200);
    this._changeDetector.detectChanges();
  }

  ngOnInit(): void {
  }

  ngOnChanges(e: SimpleChanges) {
    if(e && e.shorten && (e.shorten.currentValue != e.shorten.previousValue) && this.toolbar) {
      if(this.shorten) {
        this.toolbar.hideComment();
      } else {
        this.toolbar.showComment();
      }
    }
  }

  onClickClose() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      const [path, query] = this._location.path().split('?');
      const queryParams: any = {};

      if(query) {
        const array = query.split('&');
        array.forEach(s => {
          const array = s.split('=');
          queryParams[array[0]] = array[1] || null
        });
      }
    
      queryParams.post = null;
      this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});
    } else {
      this._location.back();
    }  
  }

  onClickContent() {
    const query = location ? location.search : '';

    this._router.navigate(
      ['./'], {
        queryParams: { post: this.post._id }, 
        relativeTo: this._route, 
        replaceUrl: !!query.match('post')
      }
    );
  }
}