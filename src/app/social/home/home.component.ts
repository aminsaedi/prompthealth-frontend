import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ChildActivationStart, NavigationEnd, NavigationStart, Router } from '@angular/router';
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

  public countChildActivationStart: number = 0;
  public routeChangedWithinProfile: boolean = false;
  
  public urlPrev: {
    path: string,
    query: string,
    full: string,
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
    console.log('destroy')
    this.routerEventSubscription.unsubscribe();
  }
  ngOnInit(): void {
    this.urlPrev = this.getURLset();
    console.log('init');

    this.routerEventSubscription = this._router.events.subscribe(e => {
      // console.log(location.pathname)

      if(e instanceof NavigationStart) {
        this.isPopState = !!(e.navigationTrigger ==  'popstate');
      }

      if(e instanceof ChildActivationStart) {
        this.countChildActivationStart ++;
        this.onProfile = !!(e.snapshot.routeConfig && e.snapshot.routeConfig.path == ':userid');
      }

      if(e instanceof NavigationEnd) {
        const urlCurrent = this.getURLset();
        const routeChangedWithinProfile = !!(this.countChildActivationStart == 1 && this.onProfile);

        if(this.isPopState) {
          //do not scroll
          console.log('popState');
        } else if(routeChangedWithinProfile) {
          //do not scroll
          console.log('routeChangedWithinProfile');
        } else if(urlCurrent.path == this.urlPrev.path) {          
          console.log('pathNotChanged');
        } else {
          this.scrollToTop();
          console.log('scrollToTop');
        }

        this.urlPrev = this.getURLset();

        this.onProfile = false;
        this.countChildActivationStart = 0;
      }
    });
  }

  scrollToTop() {
    window.scroll(0,0);
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

}
