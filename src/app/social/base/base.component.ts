import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IResponseData } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  animations: [expandVerticalAnimation],
})
export class BaseComponent implements OnInit {

  get userId() { return this.user._id; }
  get userRole() { return this.user.role || 'U'; }
  get userName() { return this.user.nickname; }
  get user() { return this._profileService.profile; }


  get postForModal() { return this._modalService.data as ISocialPost; }
  get postTitleForModal() {
    const d: ISocialPost = this._modalService.data;
    if(d && (d.isArticle || d.isEvent)) {
      return d.title;
    } else if(d) {
      return d.summary;
    }
  }

  public isDeletingContent: boolean = false;

  private isPopState: boolean = false;
  
  private subscriptionRouterEvent: Subscription; 
  
  private urlPrev: {
    path: string,
    query: string,
    full: string,
  };

  constructor(
    private _router: Router,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _modalService: ModalService,
    private _uService: UniversalService,
    private _socialService: SocialService,
    private _toastr: ToastrService,
  ) { }

  ngOnDestroy() {
    if(this.subscriptionRouterEvent) {
      this.subscriptionRouterEvent.unsubscribe();
    }
  }

  ngOnInit(): void {
    if(!this._uService.isServer) {
      this.scrollToTop();
    }
    
    this.urlPrev = this.getURLset();

    this.subscriptionRouterEvent = this._router.events.subscribe(e => {

      if(e instanceof NavigationStart) {
        this.isPopState = !!(e.navigationTrigger ==  'popstate');
      }

      if(e instanceof NavigationEnd) {
        const urlCurrent = this.getURLset();

        // if url has fragment (#), scroll-to-fragment is controlled by another component (ex: cardComponent)
        if(urlCurrent.path.match(/community\/(feed|article|media|event)/)){
          if(this.urlPrev.path != urlCurrent.path) {
            this.scrollToTop();
          }
        } else if(this.isPopState) {
          //do not scroll
          // console.log('popState');
        } else if(urlCurrent.path.match(/community\/profile\/\w+\/post/)) {
          this.scrollToTop();
          // console.log('scrollToTop (on post single page)');
        } else if(urlCurrent.path.match('profile') && this.urlPrev.path.match('profile')) {
          //do not scroll
          // console.log('routeChangedWithinProfile');
        } else if(urlCurrent.path == this.urlPrev.path) {
          // console.log('pathNotChanged');
        } else {
          this.scrollToTop();
          // console.log('scrollToTop');
        }

        this.urlPrev = this.getURLset();
      }
    });
  }

  scrollToTop(behavior: ScrollToOptions['behavior'] = 'auto') {
    window.scrollTo({top: 0, left: 0, behavior: behavior});
  }

  getURLset() {
    const urlset = {
      path: null,
      query: null,
      full: null,
    };

    if(location) {
      urlset.path = location.pathname,
      urlset.query = location.search,
      urlset.full = location.pathname + location.search
    }  

    return urlset;
  }


  onChangeLoginState(state: 'start'|'done') {
    if(state == 'done') {
      this._modalService.hide();        
    }
  }

  onClickDeleteContent(p: ISocialPost) {
    if(this.user && this.user._id == p.authorId) {
      this.isDeletingContent = true;

      this._sharedService.deleteContent('note/delete/' + p._id).subscribe((res: IResponseData) => {
        if(res.statusCode == 200) {
          this._modalService.hide();
          this._socialService.removeCacheSingle(p);
          this._toastr.success('Deleted content successfully');
        } else {
          console.log(res);
          this._toastr.error('Could not delete. Please try again later');
        }
      }, (error) => {
        console.log(error);
        this._toastr.error('Could not delete. Please try again later.');
      }, () => {
        this.isDeletingContent = false;
      });        
    } else {
      this._toastr.error('You are not eligible to delete this content.');
      this._modalService.hide();
    }
  }
}
