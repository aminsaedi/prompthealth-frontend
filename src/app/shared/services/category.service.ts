import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, Subscription } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  public categoryList: Category[];

  constructor(
    private toastr: ToastrService,
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

  getCategoryAsync(): Promise<Category[]>{
    return new Promise((resolve, reject) => {
      if(!this.categoryList){
        this.subscriptionCat = this.observeCategoryService().subscribe(() => {
          this.subscriptionCat.unsubscribe();
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
        this.emitCategoryService();
      }
    }, (error) => {
      console.error(error);
      this.toastr.error('There are some error please try after some time.');
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