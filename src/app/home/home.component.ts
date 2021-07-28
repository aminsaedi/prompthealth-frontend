import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared/services/shared.service';
import { HeaderStatusService } from '../shared/services/header-status.service';
import { environment } from 'src/environments/environment';
import { UniversalService } from '../shared/services/universal.service';
import { Category, CategoryService } from '../shared/services/category.service';
import { IUserDetail } from '../models/user-detail';
import { CategoryViewerController } from '../models/category-viewer-controller';
import { expandVerticalAnimation } from '../_helpers/animations';
import { Professional } from '../models/professional';
import { CityId, getLabelByCityId } from '../_helpers/location-data';
import { BlogSearchQuery, IBlogSearchResult } from '../models/blog-search-query';
import { Blog, IBlog } from '../models/blog';
import { ExpertFinderController } from '../models/expert-finder-controller';
import { smoothHorizontalScrolling } from './smooth-scroll';

/** for event bright */
// declare function registerEvent(eventId, action): void;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
  ) {
  }

    ////// NEW
    @ViewChild('expertFinderScrollHorizontal') elExpertFinderScrollHorizontal: ElementRef;
    public pageCurrentPractitionersFeatured: number = 0
    public citiesFeatured: {id: CityId, label: string}[];
    public blogs: Blog[];

    private timerResize: any = null;
    private previousScreenWidth: number = 0;

    @HostListener('window:resize', ['$event']) WindowResize(e: Event) {
      if(this.categories && window.innerWidth && window.innerWidth != this.previousScreenWidth) {
        this.previousScreenWidth = window.innerWidth;
        this.categoryController.disposeAll();

        if(this.timerResize) {
          clearTimeout(this.timerResize);
        }
  
        this.timerResize = setTimeout(() => {
          this.categoryController = new CategoryViewerController(this.categories);
          this.expertFinderController.initLayout();
          this._changeDetector.detectChanges();
        }, 500); 
  
      }
    }

    private categories: Category[];
    public categoryController: CategoryViewerController;

    public expertFinderController: ExpertFinderController = new ExpertFinderController();
    public countPractitionersFeaturedPerPage: number = 7;

    changeHeaderShadowStatus(isShown: boolean) {
      if(isShown) {
        this._headerStatusService.showShadow();
      } else {
        this._headerStatusService.hideShadow();
      }
    }

    async getBlog() {
      const query = new BlogSearchQuery({count: 3});
      this._sharedService.getNoAuth('/blog/get-all', query.json ).subscribe((res: IBlogSearchResult) => {
        if(res.statusCode === 200) {
          const blogs = [];
          res.data.data.forEach(d => {
            blogs.push(new Blog(d));
          });
          this.blogs = blogs;
        } else {
          console.log(res.message);
          this.blogs = [];
        }
      }, (error) => {
        console.log(error);
        this.blogs= [];
      });
    }

    ngAfterViewInit() {
      if(!this._uService.isServer) {
        this.elExpertFinderScrollHorizontal.nativeElement.scrollTo({left: 10000});
      }
    }

    onEnterExpertFinder(isLeaving: boolean) {
      if(!isLeaving) {
        const el = this.elExpertFinderScrollHorizontal.nativeElement as HTMLElement;
        const start = el.scrollLeft;
        if(start > 0) {
          smoothHorizontalScrolling(el, Math.floor(start * 2 / 9), -start, start);
        }
      }
    }
    ////// NEW END

  AWS_S3 = '';


  // eventbriteCheckout(event) {
  //   registerEvent(146694387863, (res) => {
  //     // console.log(res);
  //   });
  // }

  ngOnInit() {
    this._uService.setMeta(this.router.url, {
      title: 'PromptHealth | Your health and wellness personal assistant',
      description: 'Take control of your health with options tailored to you',
    });

    this._catService.getCategoryAsync().then((cats => {
      this.categories = cats;
      this.categoryController = new CategoryViewerController(this.categories);
    }));

    const cityIdsFeatured: CityId[] = ['toronto', 'vancouver', 'victoria', 'hamilton', 'richmond', 'burnaby', 'calgary', 'winnipeg'];
    const citiesFeatured: {id: CityId, label: string}[] = [];
    for(let id of cityIdsFeatured) {
      citiesFeatured.push({id: id, label: getLabelByCityId(id)});
    }
    this.citiesFeatured = citiesFeatured;

    const ls = this._uService.localStorage;
    this.AWS_S3 = environment.config.AWS_S3;

    this.getBlog();

    if (!this._uService.isServer) {
      // await this.getHomePageFeatures(); /** need to reinstate after many practitioners buy addonPlan */
      this.getPractitionersFeatured(); /** temporary solition */
    }

  }

  /** need to reinstate after many practitioners buy addonPlan */
  getHomePageFeatures(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._sharedService.getNoAuth('/addonplans/get-featured', { roles: ['SP', 'C'] }).toPromise().then((res: any) => {
        res.data.forEach(item => {
        });
        resolve(true);
      });  
    });
  }

  /** temporary solution to fill featured practitioners */
  getPractitionersFeatured() {
    this._sharedService.getNoAuth('user/get-paid-spc').subscribe((res: any) => {
      if (res.statusCode === 200) {
        const users: Professional[] = [];
        res.data.forEach((d: IUserDetail) => {
          users.push(new Professional(d._id, d));
        });
        this.expertFinderController.addData(users);
      }
    }, (error) => { console.log(error); });
  }
}

