import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit {

  @Input() initialState: 'off' | 'on' = 'off';
  @Input() labels: [string, string] = [null, null];
  @Input() switchStyle: {[k: string]: number | string} = null;
  @Input() option: IOptionSwitch = {}

  @Output() changeState = new EventEmitter<string>();

  get hundleWidth() {
    return (this._isOn ? this._option.ratioWhenActive[1] : this._option.ratioWhenActive[0]) + '%';
  }

  get hundlePosition() {
    return (!this._isOn ? 0 : (100 - this._option.ratioWhenActive[1]) * 100 / this._option.ratioWhenActive[1]) + '%';
  }

  public _option: OptionSwitch;
  public _isOn = false;

  constructor() { }

  ngOnInit(): void {
    this._option = new OptionSwitch(this.option);
    this._isOn = this.initialState == 'on' ? true : false;
  }

  toggleSwitch() {
    this._isOn = !this._isOn;
    this.changeState.emit(this._isOn ? 'on' : 'off');
  }
}

interface IOptionSwitch {
  width?: number;
  ratioWhenInactive?: [number, number];
}

class OptionSwitch implements IOptionSwitch {
  get ratioWhenInactive() { return this._ratioWhenInactive; }
  get ratioWhenActive() { return this._ratioWhenActive}

  _ratioWhenInactive: IOptionSwitch['ratioWhenInactive'];
  _ratioWhenActive: IOptionSwitch['ratioWhenInactive'] = [100, 100];

  constructor(private data: IOptionSwitch = {}) {
    this._ratioWhenInactive = data.ratioWhenInactive ? data.ratioWhenInactive : [44, 44]
    this._ratioWhenInactive.forEach((v,i) => {
      this._ratioWhenActive[1 - i] = this.ratioWhenActive[1 - i] - v;
    });
  }
}

