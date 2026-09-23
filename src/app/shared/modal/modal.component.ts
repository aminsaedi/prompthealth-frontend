import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output , OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  @Input() bodyStyle: any;
  @Input() id: string;
  // @Input() bodyClass: any;
  @Input() option: IModalOption = {};

  @Output() onStateChanged = new EventEmitter<ModalStateType>();

  constructor(
    private _route: ActivatedRoute,
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

  /* The backdrop closes through here too. It used to run a copy of the
   * service's back/next logic that cleared only ?modal, so closing a
   * deep-linked data modal by the backdrop left modal-data in the address and
   * the service's data behind. */
  hide(goNext: boolean = false, routeNext: string[] = null) {
    this._modalService.hide(goNext, routeNext);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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