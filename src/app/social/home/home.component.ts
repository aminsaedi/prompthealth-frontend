import { Component, OnInit } from '@angular/core';
import { ChildActivationStart, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [expandVerticalAnimation],
})
export class HomeComponent implements OnInit {

  get topics() { return this._catService.categoryList; }


  public isPopState: boolean = false;
  public onProfile: boolean = false;
  public urlPrev: {
    path: string,
    query: string,
    full: string,
    onProfile: boolean,
  };

  private routerEventSubscription: Subscription; 

  constructor(
    private _catService: CategoryService,
    private _router: Router,
  ) { }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnDestroy() {
    this.routerEventSubscription.unsubscribe();
  }
  ngOnInit(): void {
    this.urlPrev = this.getURLset({onProfile: true});
    ///cannot get if onProfile or not. 
    ///if user is on top page and go to profile page, scroll is not triggered.
    ///no solution for this.

    this.routerEventSubscription = this._router.events.subscribe(e => {
      if(e instanceof NavigationStart) {
        this.isPopState = !!(e.navigationTrigger ==  'popstate');
      }

      if(e instanceof ChildActivationStart) {
        this.onProfile = !!(e.snapshot.routeConfig && e.snapshot.routeConfig.path == ':userid');
      }

      if(e instanceof NavigationEnd) {
        const urlCurrent = this.getURLset({onProfile: this.onProfile});
        if(this.isPopState) {
          //do not scroll
        } else if(urlCurrent.onProfile) {
          if(!this.urlPrev.onProfile) {
            this.scrollToTop();
          } else {
            //do not scroll
          }
        } else if(urlCurrent.path != this.urlPrev.path) {          
            console.log('scroll!!')
            this.scrollToTop();
        }

        this.urlPrev = this.getURLset({onProfile: this.onProfile});
      }
    });
  }

  scrollToTop() {
    window.scroll(0,0);
  }

  getURLset(data: {onProfile: boolean}) {
    const urlset = {
      path: null,
      query: null,
      full: null,
      onProfile: data.onProfile,
    };

    if(location) {
      urlset.path = location.pathname,
      urlset.query = location.search,
      urlset.full = location.pathname + location.search
    }  

    return urlset;
  }

}
