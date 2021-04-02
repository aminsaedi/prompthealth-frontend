export type PartnerSortByType = 'createdAt' | 'price' | 'rating';

export interface IPartnerSearchFilterQuery {
  /** filter */
  services?: string[];
  priceLevel?: number;
  keyword?: string; 
  featured?: boolean;

  /** sort */
  sortBy?: PartnerSortByType;

  /**  other params */
  count?: number;
  page?: number;

  /** fixed value . don't change to other than 1*/
  frontend?: number;
}

type FilterType = 'services' | 'sortBy' | 'count' | 'page' | 'priceLevel' | 'keyword' | 'featured';
export class PartnerSearchFilterQuery implements IPartnerSearchFilterQuery {
  private _services: string[] = [];
  private _priceLevel: number = 0;
  private _keyword: string = ''; 
  private _featured: boolean = false;
  private _sortBy: PartnerSortByType = 'createdAt';
  private _count: number = 20;
  private _page: number = 1;
  private _frontend: number = 1;

  get services() { return this._services; }
  get sortBy() { return this._sortBy; };
  get count() { return this._count; };
  get page() { return this._page; };
  get priceLevel() { return this._priceLevel; };
  get keyword() { return this._keyword; }; 
  get frontend() { return this._frontend; };
  get featured() { return this._featured; };
  get json() { return {
    services: this.services,
    sortBy: this.sortBy,
    count: this.count,
    page: this.page,
    priceLevel: this.priceLevel,
    keyword: this.keyword,
    frontend: this.frontend,
    featured: this.featured,
  } as IPartnerSearchFilterQuery; }
 
  constructor(data: IPartnerSearchFilterQuery = {}){
    Object.keys(data).forEach(key => {
      if(data && data[key]){
        this['_' + key] = data[key];
      }
    });
  }

  setValue(key: FilterType, val: any){
    this['_' + key] = val;
  }

  resetFilter(){
    this._services = [];
    this._keyword = '';
    this._priceLevel  = 0;
    this._featured = false;
  }

  resetSort(){
    this._sortBy = 'createdAt';
  }

  reset(){
    this.resetFilter();
    this.resetSort();
  }
}