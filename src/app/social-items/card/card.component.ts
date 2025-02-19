import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { ISocialPost } from 'src/app/models/social-post';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';
import { CardItemToolbarComponent } from '../card-item-toolbar/card-item-toolbar.component';
import { SocialService } from '../../social/social.service';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() post: ISocialPost;
  @Input() shorten: boolean = true;

  @Input() option: ICardOption = {};


  get topics(): Category[] { return this._categoryService.categoryList; }
  get selectedTopicId() { return this._socialService.selectedTopicId; }


  // public isContentGradientShown: boolean = false;
  public _option: CardOption;


  @ViewChild('toolbar') private toolbar: CardItemToolbarComponent;
  @ViewChild('content') private content: ElementRef;
  @ViewChild('anchor') private anchor: ElementRef;

  constructor(
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _location: Location,
    private _modalService: ModalService,
    private _categoryService: CategoryService,
    private _socialService: SocialService,
  ) { }

  ngAfterViewInit() {
    // const el = this.content.nativeElement as HTMLDivElement;
    // this.isContentGradientShown = (el.clientHeight >= 200);

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
  
  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

  stopPropergation(e: Event) {
    e.stopPropagation();
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