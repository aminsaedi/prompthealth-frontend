import { Injectable } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, Subscription } from 'rxjs';
import { SharedService } from './shared.service';
import { slugify } from 'src/app/_helpers/slugify';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  get categoryListFlatten(): {_id: string, item_text: string}[] {
    let result = [];
    if(this.categoryList) {
      for (let cat of this.categoryList) {
        result.push({_id: cat._id, item_text: cat.item_text});
        result = result.concat(cat.subCategory); 
      }
    }
    return result;
  }

  public categoryList: Category[];
  private _categoryLoaded = false;


  constructor(
    // private toastr: ToastrService,
    private _sharedService: SharedService,
  ) {
    this.getCategoryServices();
  }

  public observeCategoryService(): Observable<void>{ return this.categoryServiceObserver; }
  private categoryServiceObserver = new Subject<void>();
  private emitCategoryService(){ this.categoryServiceObserver.next(); }

  private subscriptionCat: Subscription;


  iconOf(cat: Category): string {
    const img = cat.image;
    const img2 = img.toLowerCase().replace(/_/g, '-').replace('.png', '');
    return img2
  }

  titleOf(id: string): string {
    let title = '';
    if(this.categoryList) {
      const cat: Category = this.categoryList.find(_cat => id == _cat._id);
      if(cat) {
        title = cat.item_text;
      }
    }
    return title;
  }

  titleOfBySlug(slug: string): string {
    if(this.categoryList) {
      const match = this.categoryListFlatten.find(c => slugify(c.item_text) === slug);
      if(match) {
        return match.item_text;
      }
    }
    return '';
  }

  getCategoryAsync(): Promise<Category[]>{
    return new Promise((resolve, reject) => {
      if(!this._categoryLoaded){
        this.subscriptionCat = this.observeCategoryService().subscribe(() => {
          resolve(this.categoryList)
        });
      }else{
        resolve(this.categoryList);
      }
    });
  }

  getCategoryServices() {
    this._sharedService.getNoAuth('questionare/get-service').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.categoryList = [];
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].category_type.toLowerCase() === 'goal') {
            this.categoryList = res.data[i].category;
            break;
          }
        }
        this._categoryLoaded = true;
        this.emitCategoryService();
      }
    }, (error) => {
      console.error(error);
      this._categoryLoaded = true;
      this.emitCategoryService();
    });
  }
}



export interface Category {
  _id: string;
  item_text: string;
  image: string;
  subCategory: SubCategory[];
  userType?: any; /** to avoid error on subscription-plan.component (it doesn't exist.)*/
}

export interface SubCategory {
  _id: string;
  item_text: string;
}