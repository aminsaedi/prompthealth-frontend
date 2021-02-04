import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from './shared.service';
import { Subject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  public categoryList: Category[];
  constructor(
    private _sharedService: SharedService,
    private toastr: ToastrService
  ) {
    this.getCategoryServices();
  }

  public observeCategoryService(): Observable<void>{ return this.categoryServiceObserver; }
  private categoryServiceObserver = new Subject<void>();
  private emitCategoryService(){ this.categoryServiceObserver.next(); }

  private subscriptionCat: Subscription;
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
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.categoryList = [];
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].category_type.toLowerCase() === 'goal') {
            this.categoryList = res.data[i].category;
            break;
          }
        }
        this.categoryList.forEach((cat, i) => {
          let label = cat.item_text.toLowerCase();
          label = label.replace(/[\/\s]/g, '_');
          this.categoryList[i].label = label.replace(/[^0-9a-zA-Z_]/g, '');
        });
        this.emitCategoryService();
      }
    }, (error) => {
      console.error(error);
      this.toastr.error('There are some error please try after some time.');
      this._sharedService.loader('hide');
    });
  }


}


export interface Category {
  _id: string;
  item_text: string;
  label: string;
  subCategory: SubCategory[];
  userType?: any; /** to avoid error on subscription-plan.component (it doesn't exist.)*/
}

export interface SubCategory {
  _id: string;
  item_text: string;
}