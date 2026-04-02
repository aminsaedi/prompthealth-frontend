import { Component, OnInit , OnDestroy } from '@angular/core';
import { IBlogCategory } from 'src/app/models/blog-category';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss'],
  animations: [fadeAnimation, expandVerticalAnimation],
})
export class HeaderMagazineComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  public categories: any[];
  public tags: any[];

  public isTagMenuShown: boolean = false;

  constructor(
    private _sharedService: SharedService,
  ) { }

  isCategoryEvent(cat: IBlogCategory) {
    return !!(cat.slug.match(/event/));
  } 

  ngOnInit(): void {
    this.getCategories();
    this.getTags();
  }

  toggleTagMenu() {
    if(this.isTagMenuShown) {
      this.hideTagMenu();
    } else {
      this.showTagMenu();
    }
  }
  showTagMenu() {
    this.isTagMenuShown = true;
  }
  hideTagMenu() {
    this.isTagMenuShown = false;
  }

  getCategories() {
    this._sharedService.getNoAuth('category/get-categories').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.categories = res.data;
      }
    });
  }

  getTags() {
    this._sharedService.getNoAuth('tag/get-all').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if(res.statusCode === 200) {
        this.tags = res.data.data;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
