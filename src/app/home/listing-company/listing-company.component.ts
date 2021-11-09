import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Partner } from '../../models/partner';
import { SharedService } from '../../shared/services/shared.service';
import { FormItemServiceComponent } from '../../shared/form-item-service/form-item-service.component';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';
import { SortItem } from 'src/app/buttons/button-sort/button-sort.component';
import { CheckboxSelectionItem, FormItemCheckboxGroupComponent } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { CategoryService } from 'src/app/shared/services/category.service';
import { Subscription } from 'rxjs';
import { GetCompaniesQuery } from 'src/app/models/get-companies-query';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-listing-product',
  templateUrl: './listing-company.component.html',
  styleUrls: ['./listing-company.component.scss']
})
export class ListingCompanyComponent implements OnInit {

  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _catService: CategoryService,
    private _modalService: ModalService,
  ) { }

  get f() { return this.form.controls; }
  get isFilterOn() { return this.selectedTypeIds?.length > 0 || this.selectedTopicIds?.length > 0; }

  public products: Partner[];
  public form: FormGroup;

  public sortItems: SortItem[] = [
    {id: 'nameAsc', label: 'Name (A → Z)', labelShort: 'Name', type: 'alphabet', order: 'asc', sortBy: 'firstName'},
    {id: 'nameDesc', label: 'Name (Z → A)', labelShort: 'Name', type: 'alphabet', order: 'desc', sortBy: 'firstName'},
    {id: 'createdAtAsc', label: 'Latest', type: 'number', order: 'desc', sortBy: 'createdAt'},
    {id: 'createdAtDesc', label: 'Oldest', type: 'number', order: 'asc', sortBy: 'createdAt'},
  ];

  public topicsItems: CheckboxSelectionItem[] = [];

  public typesItems: CheckboxSelectionItem[] = [
    {id: 'type1', label: 'Apps', value: 'apps'},
    {id: 'type2', label: 'Services', value: 'services'},
    {id: 'type3', label: 'Products', value: 'products'},
    {id: 'type4', label: 'Resource', value: 'resource'},
  ];

  private subscriptionTopics: Subscription;
  private selectedTypeIds: string[] = [];
  private selectedTopicIds: string[] = [];
  private selectedSort: SortItem;
  private currentKeyword: string = '';
  private countPerPage = 40;

  @ViewChild('formTopics') private formTopics: FormItemServiceComponent;
  @ViewChild('formTypes') private formTypes: FormItemCheckboxGroupComponent;

  ngOnDestroy() {
    this.subscriptionTopics?.unsubscribe();
  }

  async ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Find wellness products & services | PromptHealth',
      description: 'Discover our favorite innovative health apps, products and services. Find promo codes, free samples and reviews.',
      pageType: 'website',
    });

    if(this._catService.categoryList) {
      this.initSelectBoxTopics();
    } else {
      this.subscriptionTopics = this._catService.observeCategoryService().subscribe(() => {
        this.subscriptionTopics.unsubscribe();
        this.initSelectBoxTopics();
      });
    }

    this.form = new FormGroup({
      search: new FormControl(''),
    });

    this.f.search.valueChanges.subscribe(() => {
      this.onSearchChanged();
    });

    this.fetchCompanies();
  }

  initSelectBoxTopics() {
    const cats = this._catService.categoryList;
    this.topicsItems = cats.map(item => { 
      return {
        id: item._id,
        label: item.item_text,
        value: item._id,
      }
    });
  }

  fetchCompanies(): Promise<void> {
    this.products = null;
    return new Promise((resolve, reject) => {
      const query = new GetCompaniesQuery({
        services: this.selectedTopicIds,
        company_type: this.selectedTypeIds,
        count: this.countPerPage,
        order: this.selectedSort ? this.selectedSort.order : null,
        sortBy: this.selectedSort ? this.selectedSort.sortBy : null,
        page: this.products ? (Math.ceil(this.products?.length / this.countPerPage) + 1) : 1,
        keyword: this.currentKeyword,
      });

      this._sharedService.postNoAuth(query.toJson(), 'partner/get-all').subscribe(res => {
        if(res.statusCode == 200) {
          this.products = res.data.data.map(item => new Partner(item));
          resolve();
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }

  onChangeSort(item: SortItem) {
    this.selectedSort = item;
    this.fetchCompanies();
  }

  onChangeTopic(items: CheckboxSelectionItem[]) {
    this.selectedTopicIds = items.map(item => item.value);
    this.fetchCompanies();
  }

  onChangeType(items: CheckboxSelectionItem[]) {
    this.selectedTypeIds = items.map(item => item.value);
    this.fetchCompanies();
  }


  private timer: any;
  onSearchChanged(){
    if(this.timer){
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.setSearch();
    }, 600);
  }
  onSearchEnter() {
    if(this.timer) {
      clearTimeout(this.timer);
    }
    this.setSearch();
  }

  setSearch() {
    let keyword = this.f.search.value;
    if(!keyword || keyword.length <= 2) {
      keyword = '';
    }
    if(this.currentKeyword != keyword) {
      this.currentKeyword = keyword;
      this.fetchCompanies();
    }
  }

  onFilterSaved() {
    this.selectedTopicIds = this.formTopics.getSelected()
    this.selectedTypeIds = this.formTypes.getSelected();
    this.fetchCompanies();
    this._modalService.hide();
  }
  onFilterReseted() {
    this.formTopics.deselectAll();
    this.formTypes.deselectAll();
    this.onFilterSaved();
  }
}

