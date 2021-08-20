import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { SocialArticle, SocialEvent, SocialNote, SocialPoromotion } from 'src/app/models/social-note';
import { SocialPost } from 'src/app/models/social-post';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { CardItemToolbarComponent } from '../card-item-toolbar/card-item-toolbar.component';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() post: SocialPost|SocialNote|SocialArticle|SocialEvent|SocialPoromotion;
  @Input() shorten: boolean = true;

  @Input() option: ICardOption = {};

  get images() {
    let images: string[] = null;
    if(this.post && this.post.isNote) {
      images = (this.post as SocialNote).images;
    }
    return images;
  }

  get voice() {
    let voice: string = null;
    if(this.post && this.post.isNote) {
      voice = (this.post as SocialNote).voice || null;
    }
    return voice;
  }

  get topics(): Category[] { return this._categoryService.categoryList; }


  public isContentGradientShown: boolean = false;
  public _option: CardOption;


  @ViewChild('toolbar') private toolbar: CardItemToolbarComponent;
  @ViewChild('content') private content: ElementRef;
  @ViewChild('anchor') private anchor: ElementRef;

  constructor(
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _location: Location,
    private _modalService: ModalService,
    private _sanitizer: DomSanitizer,
    private _categoryService: CategoryService,
  ) { }

  ngAfterViewInit() {
    const el = this.content.nativeElement as HTMLDivElement;
    this.isContentGradientShown = (el.clientHeight >= 200);

    if(this._option.openCommentsOnInit) {
      this.toolbar.showComment();
    }

    this._changeDetector.detectChanges();

    this._route.fragment.pipe( first() ).subscribe(fragment => {
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
    this._option = new CardOption(this.option);
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
  
  onClickButton(buttonName: string) {
    console.log(buttonName);
    switch(buttonName) {
      case 'post-menu':
      case 'calendar-menu':
      case 'subscribe-menu':
        this._modalService.show(buttonName, this.post);
        break;
    }
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }
}

interface ICardOption {
  openCommentsOnInit?: boolean;
  showLinkToDetail?: boolean;
}

class CardOption implements ICardOption{
 
  get openCommentsOnInit() { return this.data.openCommentsOnInit === true ? true: false; }
  get showLinkToDetail() { return this.data.showLinkToDetail === false ? false : true; }

  constructor(private data: ICardOption = {}) {}
}