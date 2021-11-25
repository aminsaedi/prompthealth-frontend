import { Component, Input, OnInit } from '@angular/core';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideVerticalAnimation, slideVerticalReverse100pcAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'action-sheet-open-app',
  templateUrl: './action-sheet-open-app.component.html',
  styleUrls: ['./action-sheet-open-app.component.scss'],
  animations: [slideVerticalAnimation]
})
export class ActionSheetOpenAppComponent implements OnInit {

  @Input() path: string;

  get isAppAvailable() { return this._uService.isAppAvailable; }

  public isActionSheetHidden: boolean = false;

  constructor(
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this.isActionSheetHidden = this._uService.sessionStorage.getItem('hideActionSheetOpenApp') === 'true';
  }

  onClickOpenApp() {
    this._uService.openApp(this.path);
  }

  onClickContinueWithWeb() {
    this._uService.sessionStorage.setItem('hideActionSheetOpenApp', 'true');
    this.isActionSheetHidden = true;
  }

}
