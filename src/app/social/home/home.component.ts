import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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

  public topics: Category[] = [];
  public urlPrev: {
    path: string,
    query: string,
    full: string
  };

  constructor(
    private _catService: CategoryService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnInit(): void {
    this._catService.getCategoryAsync().then(cats => {
      this.topics = cats;
    });

    this._router.events.subscribe(e => {
      if(e instanceof NavigationEnd) {
        //TODO: scroll to appropreate position
      }
    });

    this.setUrlPrev();
  }

  setUrlPrev() {
    if(location) {
      this.urlPrev = {
        path: location.pathname,
        query: location.search,
        full: location.pathname + location.search
      }
    }   
  }

}
