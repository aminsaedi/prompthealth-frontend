import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IBlogCategory } from 'src/app/models/blog-category';
import { SharedService } from 'src/app/shared/services/shared.service';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-menu-sm',
  templateUrl: './menu-sm.component.html',
  styleUrls: ['./menu-sm.component.scss'],
})
export class MenuSmComponent implements OnInit {

  public categories: any[];
  public tags: any[];

  @ViewChild('menuSm') private menuSm: ElementRef;

  constructor(
    private _location: Location,
    private _router: Router,
    private _sharedService: SharedService,
    private _mService: MagazineService,
  ) { }

  isCategoryEvent(cat: IBlogCategory) {
    return !!(cat.slug.match(/event/));
  } 

  ngOnInit(): void {
    this.initTaxonomy();
  }

  initTaxonomy(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let isTaxonomyReady = true;
      const promiseAll = [];
      if(!this._mService.categories) {
        isTaxonomyReady = false;
        promiseAll.push(this.initCategories());
      } else {
        this.categories = this._mService.categories;
      }
      if(!this._mService.tags) {
        isTaxonomyReady = false;
        promiseAll.push(this.initTags());
      } else {
        this.tags = this._mService.tags;
      }

      if (isTaxonomyReady) {
        resolve(true);
      } else {
        Promise.all(promiseAll).then(() => {
          resolve(true);
        })
      }
    })
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `category/get-categories`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this._mService.saveCacheCategories(res.data);
          this.categories = this._mService.categories;
          resolve(true);
        }else {
          console.log(res);
          reject(res.message);
        }
      }, (error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  initTags(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = `tag/get-all`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this._mService.saveCacheTags(res.data.data);
          this.tags = this._mService.tags;
          resolve(true);
        }else {
          reject(res.message);
        }
      }, (error) => {
        console.log(error);
        reject(error);
      });  
    });
  }

  changeMenuTo(from: number, to: number) {
    if(this.menuSm && this.menuSm.nativeElement) {
      const el: HTMLElement = this.menuSm.nativeElement;
      const w: number = el.clientWidth;
      const amount = (to - from) * w;
      const start = from * w;
      
      smoothHorizontalScrolling(el, 180, amount,  start);
    }
  }

  goback() {
    this._location.back();
  }

  gonext(link: string[]) {
    this._router.navigate(link, {replaceUrl: true});
  }
}
