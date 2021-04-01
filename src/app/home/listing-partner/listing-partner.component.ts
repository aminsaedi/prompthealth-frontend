import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Partner } from '../../models/partner';
import { SharedService } from '../../shared/services/shared.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { FormServiceComponent } from '../../shared/form-service/form-service.component';
import { PartnerSortByType, PartnerSearchFilterQuery } from '../../models/partner-search-filter-query';

@Component({
  selector: 'app-listing-partner',
  templateUrl: './listing-partner.component.html',
  styleUrls: ['./listing-partner.component.scss']
})
export class ListingPartnerComponent implements OnInit {

  constructor(
    private _sharedService: SharedService,
    private _headerService: HeaderStatusService,
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

  public partners: Partner[];
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

  @ViewChild(FormServiceComponent) private formServiceComponent: FormServiceComponent;

  private timer: any;
  @HostListener ('window:resize') onWindowResize(){
    if(this.timer){ clearTimeout(this.timer); }
    this.timer = setTimeout(() => {
      this.isViewSmall = (window.innerWidth < 768) ? true : false;
    }, 300);
  }

  async ngOnInit() {
    this.isViewSmall = (window.innerWidth < 768) ? true: false; 

    this.formSearch = new FormControl();
    this.getPartners();
  }

  getPartners(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let path = 'partner/get-all';
      this._sharedService.loader('show');
      this._sharedService.postNoAuth(this.searchData.json, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if(res.statusCode == 200){
          const partners = [];
          res.data.data.forEach((data: any) => {
            partners.push(new Partner(data));
          });
          this.partners = partners;
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

  sortPartners(data: {id: PartnerSortByType, isDesc: boolean}){
    this.searchData.setValue('sortBy', data.id);
    this.getPartners();
  }

  onApplyFilter(listing: boolean = true){
    this.searchData.setValue('services', this.formServiceComponent.getSelected());
    this.hideFilter();
    if(listing){
      this.getPartners();
    }
  }

  onResetFilter(listing: boolean = true){
    this.searchData.resetFilter();
    this.formServiceComponent.reset();
    this.hideFilter();
    if(listing){
      this.getPartners();
    }
  }

  showFilter(){ this.isFilterShown = true;  }
  hideFilter(){ this.isFilterShown = false; }

  onSearchSet(){
    this.searchData.setValue('keyword', this.formSearch.value);
    this.getPartners();
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
    this.getPartners();
  }
}

