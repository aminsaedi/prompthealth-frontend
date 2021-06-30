import { Location } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Blog } from 'src/app/models/blog';
import { IBlogCategory } from 'src/app/models/blog-category';
import { BlogSearchQuery, IBlogSearchQuery } from 'src/app/models/blog-search-query';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MagazineService } from '../magazine.service';

@Component({
  selector: 'app-list-event',
  templateUrl: './list-event.component.html',
  styleUrls: ['./list-event.component.scss']
})
export class ListEventComponent implements OnInit {

  paginatorShown(page: number) {
    if(!this.paginators || this.paginators.length == 0) {
      return false;
    } else if(page <= 2 || page >= (this.paginators.length - 1)) {
      return true;
    } else {
      const dist = (this.pageCurrent == 1 || this.pageCurrent == this.paginators.length) ? 2 : 1;
      if(Math.abs(page - this.pageCurrent) > dist) {
        return false;
      } else {
        return true;
      }
    }
  }

  get isDatePickerActive() { return this.queryParams && this.queryParams.datefrom;  }
  convertNgbDateToDate(date: NgbDate) { return new Date(date.year, date.month - 1, date.day); }


  public latest: Blog;
  public archive: Blog[]
  public category: IBlogCategory /** event category data */
  public pageCurrent: number = 1;
  public paginators: number[][] = null;
  public pageTotal: number;
  public postTotal: number;
  public countPerPage: number = 12;
  public order: IQueryParams['order'];
  public orderBy: IQueryParams['orderby'];

  public queryParams: IQueryParams;
  public isDatePickerShown: boolean = false;

  public minDate: NgbDate;
  public fromDate: NgbDate = null;
  public toDate: NgbDate | null = null;
  public hoveredDate: NgbDate | null = null;
  public displayMonths = 1;

  @HostListener('window:resize') onWindowResize() {
    this.setDisplayMonths();
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _mService: MagazineService,
    private _sharedService: SharedService,
  ) { }

  async ngOnInit() {
    const now = new Date();
    this.minDate = new NgbDate( now.getFullYear(), now.getMonth() + 1, now.getDate() );
    this.setDisplayMonths();

    await this.initCategories();
    this.category = this._mService.categoryEvent;
    await this.initPosts();

    this._route.params.subscribe( async (params: { page: number }) => {
      this.pageCurrent = params.page || 1;

      this.filterPosts();
    });

    this._route.queryParams.subscribe((params: IQueryParams) => {
      this.queryParams = params;

      if(params.datefrom) {
        const dateArray = params.datefrom.split('-');
        this.fromDate = new NgbDate(Number(dateArray[0]),Number(dateArray[1]),  Number(dateArray[2]));
      } else {
        this.fromDate = null;
      }

      if(params.dateto) {
        const dateArray = params.dateto.split('-');
        this.toDate = new NgbDate(Number(dateArray[0]),Number(dateArray[1]),  Number(dateArray[2]));
      } else {
        this.toDate = null;
      }

      this.orderBy = params.orderby || 'startAt';
      this.order = params.order || 'desc';

      this.isDatePickerShown = !!(params.modal == 'date-picker');

      this.filterPosts();
    }); 
  }

  initCategories(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._mService.categories) {
        resolve(true);
      } else {
        const path = `category/get-categories`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if (res.statusCode === 200) {
            this._mService.saveCacheCategories(res.data);
            resolve(true);
          }else {
            console.log(res);
            reject(res.message);
          }
        }, (error) => {
          console.log(error);
          reject(error);
        });
      }  
    });
  }

  initPosts(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const posts = this._mService.postsOf(this.category._id, 1, 0 ,10000);
      if (posts) {
        resolve(true);
      } else {
        const params: IBlogSearchQuery = {
          count: 10000,
          page: 1,
          categoryId: this.category._id
        }
        const query = new BlogSearchQuery(params);
        const path = `blog/get-all${query.queryParams}`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if(res.statusCode === 200) {
            this._mService.saveCache(res.data, 1, this.category._id);
            resolve(true);
          }
        });
      }
    });
  }

  filterPosts() {
    const posts= this._mService.postsOf(this.category._id, 1, 0, 10000);
    this.latest = (posts && posts.length > 0) ? posts[0] : null;
    
    const archive = posts.slice(1);

    const now = new Date();
    const upcoming = archive.filter(b => {
      return (b.event.endAt.getTime() > now.getTime());
    });

    const filterByDateRange = upcoming.filter(b => {
      const start = b.event.startAt;
      if(!this.fromDate) {
        return true;
      } else if(!this.toDate) {
        const target = this.convertNgbDateToDate(this.fromDate);
        if(start.getFullYear() == target.getFullYear() && start.getMonth() == target.getMonth() && start.getDate() == target.getDate()) {
          return true;
        } else {
          return false;
        }
      } else {
        const from = this.convertNgbDateToDate(this.fromDate);
        const to = this.convertNgbDateToDate(this.toDate);
        to.setDate(to.getDate() + 1);
        if(from.getTime() <= start.getTime() && start.getTime() < to.getTime()) {
          return true;
        } else {
          return false;
        }
      }
    });

    const sorted = filterByDateRange.sort((a,b) => {
      const valA = a.event.startAt.getTime();
      const valB = b.event.startAt.getTime();
      if(this.order == 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    const offset = (this.pageCurrent - 1) * this.countPerPage; 

    this.archive = sorted.slice(offset, offset + this.countPerPage);

    this.postTotal = upcoming.length + (this.latest ? 1 : 0);
    this.pageTotal = Math.ceil(sorted.length / this.countPerPage);
    this.setPaginators();
  }

  onOrderChanged() {
    this.order = this.order == 'asc' ? 'desc' : 'asc';
    const queryparams = { ... this.queryParams };
    queryparams.order = this.order;
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: queryparams});
  }

  setPaginators() {
    if(!this.pageTotal || this.pageTotal <= 1) {
      this.paginators = null;
    } else {
      const paginators: {page: number; shown: boolean;}[] = [];
      for(let i=1; i<=this.pageTotal; i++) {
        let shown = false;
        if(i == 1 || i == this.pageTotal) { 
          shown = true; 
        } else {
          const dist = (this.pageCurrent == 1 || this.pageCurrent == this.pageTotal) ? 2 : 1;
          if(Math.abs(i - this.pageCurrent) > dist) {
            shown = false;
          } else {
            shown = true;
          }
        }

        paginators.push({
          page: i,
          shown: shown,
        });
      }

      this.paginators = [[]];
      paginators.forEach(p => {
        if(p.shown) {
          this.paginators[this.paginators.length - 1].push(p.page);
        } else {
          if(this.paginators[this.paginators.length - 1].length > 0) {
            this.paginators.push([]);
          }
        }
      });
    }
  }

  showModal(modal: ModalType) {
    if(!this.isDatePickerShown) {
      const queryparams = { ... this.queryParams };
      queryparams.modal = modal;
      this._router.navigate(['./'], {relativeTo: this._route, queryParams: queryparams});
    }
  }

  onDatePickerCanceled() {
    this.closeDatePicker(this.queryParams);
  }

  onDatePickerReseted() {
    const queryparams: IQueryParams = {...this.queryParams};
    queryparams.datefrom = null;
    queryparams.dateto = null;
    this.closeDatePicker(queryparams);
  }

  onDatePickerUpdated() {
    const queryparams: IQueryParams = {...this.queryParams};
    queryparams.datefrom = this.fromDate ? `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}` : null;
    queryparams.dateto = this.toDate ? `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}` : null;

    this.closeDatePicker(queryparams);
  }

  closeDatePicker(next: IQueryParams) {
    const current = this.queryParams;
    if(next.datefrom == current.datefrom && next.dateto == current.dateto) {
      this._location.back();
    } else {
      next.modal = null;
      this._router.navigate(['./'], {queryParams: next, relativeTo: this._route, replaceUrl: true});
    }
    this.resetDatePicker();
  }


  /** modalDatePicker START */
  setDisplayMonths() {
    this.displayMonths = (window && window.innerWidth >= 768) ? 2 : 1;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  resetDatePicker() {
    this.fromDate = null;
    this.toDate = null;
  }


  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  isDisabled(date: NgbDate) {
    return date.before(this.minDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }
  /** modalDatePicker END */
}


type ModalType = 'date-picker';

interface IQueryParams {
  modal: 'date-picker';
  datefrom: string;
  dateto: string;
  orderby: 'startAt' ;
  order: 'desc' | 'asc';
}