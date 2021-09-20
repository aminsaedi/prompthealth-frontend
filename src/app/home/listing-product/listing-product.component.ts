import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Partner } from '../../models/partner';
import { SharedService } from '../../shared/services/shared.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { FormItemServiceComponent } from '../../shared/form-item-service/form-item-service.component';
import { PartnerSortByType, PartnerSearchFilterQuery } from '../../models/partner-search-filter-query';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listing-product',
  templateUrl: './listing-product.component.html',
  styleUrls: ['./listing-product.component.scss']
})
export class ListingProductComponent implements OnInit {

  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _headerService: HeaderStatusService,
    private _uService: UniversalService,
  ) { }

  get currentSortTarget() { return this.searchData.sortBy; }
  get currentPage() { return this.searchData.page; }
  get countPerPage() { return this.searchData.count; }
  get countPageTotal(){ return Math.ceil(this.totalCount / this.countPerPage);}
  get filterServices(){ return this.searchData.services; }
  get paginator(){ 
    const p = [];
    for(let i = 1; i <= this.countPageTotal; i++) { p.push(i); }
    return p;
  }

  public products: Partner[];
  public totalCount: number;

  public formSearch: FormControl;
  public isFilterShown: boolean = false;
  public isViewSmall = false;

  public sortData: {id: PartnerSortByType, label: string, isDesc: boolean}[] = [
    {id: 'createdAt', label: 'Newest', isDesc: false},
    {id: 'rating', label: 'Top-rated', isDesc: true},
    {id: 'price', label: 'Price', isDesc: false},
  ]; 

  private searchData = new PartnerSearchFilterQuery();

  @ViewChild(FormItemServiceComponent) private formItemServiceComponent: FormItemServiceComponent;

  private timer: any;
  @HostListener ('window:resize') onWindowResize(){
    if(this.timer){ clearTimeout(this.timer); }
    this.timer = setTimeout(() => {
      this.isViewSmall = (window.innerWidth < 992) ? true : false;
    }, 300);
  }

  async ngOnInit() {
    this.isViewSmall = (window.innerWidth < 992) ? true: false; 
    this._uService.setMeta(this._router.url, {
      title: 'Products and Services | PromptHealth',
      description: 'Discover our favorite innovative health apps, products and services. Find promo codes, free samples and reviews.',
      pageType: 'website',
      image: 'https://prompthealth.ca/assets/img/listing-product.png',
      imageType: 'image/png',
      imageAlt: 'PromptHealth',
    });

    this.formSearch = new FormControl();
    this.getProducts();
  }

  getProducts(): Promise<boolean> {
    this.products = null;
    return new Promise((resolve, reject) => {
      let path = 'partner/get-all';
      this._sharedService.loader('show');
      this._sharedService.postNoAuth(this.searchData.json, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if(res.statusCode == 200){
          const products = [];
          res.data.data.forEach((data: any) => {
            products.push(new Partner(data));
          });
          this.products = products;
          this.totalCount = res.data.total;
          resolve(true);
        }else{
          reject(res.message)
        }
      }, error => {
        console.log(error);
        this._sharedService.loader('hide');
        reject('There are some error please try after some time.');
      });
    });
  }

  sortProducts(data: {id: PartnerSortByType, isDesc: boolean}){
    this.searchData.setValue('sortBy', data.id);
    this.getProducts();
  }

  onApplyFilter(listing: boolean = true){
    this.searchData.setValue('services', this.formItemServiceComponent.getSelected());
    this.hideFilter();
    if(listing){
      this.getProducts();
    }
  }

  onResetFilter(listing: boolean = true){
    this.searchData.resetFilter();
    this.formItemServiceComponent.reset();
    this.hideFilter();
    if(listing){
      this.getProducts();
    }
  }

  showFilter(){ this.isFilterShown = true;  }
  hideFilter(){ this.isFilterShown = false; }

  onSearchSet(){
    this.searchData.setValue('keyword', this.formSearch.value);
    this.getProducts();
  }

  onChangeFilter(services: string[]){
    this.searchData.setValue('services', services);
  }

  onChangeStickyStatus(isSticked: boolean){
    if(isSticked){ this._headerService.hideHeader(); }
    else{ this._headerService.showHeader(); }
  }

  backPage(){
    const page = this.searchData.page;
    if(page > 1){
      this.changePage(page - 1);
    }else{
      console.log('you are on first page');
    }
  }

  nextPage(){
    const page = this.searchData.page;
    const pageLast = Math.ceil(this.totalCount / this.countPerPage);
    if(page < pageLast){
      this.changePage(page + 1);
    }else{
      console.log('you are on last page');
    }
  }

  changePage(i: number){
    this.searchData.setValue('page', i);
    this.getProducts();
  }
}

