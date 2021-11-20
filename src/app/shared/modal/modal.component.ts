import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() bodyStyle: any;
  @Input() id: string;
  // @Input() bodyClass: any;
  @Input() option: IModalOption = {};

  @Output() onStateChanged = new EventEmitter<ModalStateType>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _modalService: ModalService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  public isShown: boolean = false;
  public _option: ModalOption;

  ngOnInit(): void {
    this._option = new ModalOption(this.option);

    this._route.queryParams.subscribe((params: {modal: string, 'modal-data': string}) => {
      let isShown: boolean = !!(params.modal && params.modal == this.id);
      if(isShown && params['modal-data']) {
        const data = this._modalService.data;
        if(!data || params['modal-data'] != data._id) {
          this._modalService.hide();
          isShown = false;
        }
      }

      if(this.isShown != isShown) {
        this.isShown = isShown;
        this.onStateChanged.emit(isShown ? 'open' : 'close');
        this._changeDetector.detectChanges();  
      }

      // console.log('modalComponent. id: ', this.id, ': status: ', this.isShown ? 'shown' : 'hidden');
    });
  }

  show(data: any = null) {
    this._modalService.show(this.id, data);
  }

  hide(goNext: boolean = false, routeNext: string[] = null) {
    this._modalService.hide(goNext, routeNext);
  }

  goBack() {
    const state = this._location.getState() as any;
    if(state?.navigationId == 1) {
      this.goNext();
    } else {
      this._location.back();
    }
  }

  goNext() {
    const [path, queryParams] = this._modalService.currentPathAndQueryParams;
    queryParams.modal = null;
    this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});
  }
}

interface IModalOption {
  expandedSm?: boolean;
  disableCloseByClickingDrop? : boolean;
}

class ModalOption implements IModalOption {

  get expandedSm() { return !!(this.data.expandedSm === true); }
  get disableCloseByClickingDrop() { return !!(this.data.disableCloseByClickingDrop === true); }

  constructor(private data: IModalOption) {}
}

export type ModalStateType = 'open' | 'close';