import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  @Input() data: StepperItem[] = [
    {label: 'Age'},
    {label: 'Health Background'},
    {label: 'Goal'},
    {label: 'Availability'}
  ];

  @Input() type: string = 'regular' /** regular ==> for midium or bigger, simple ==> for small */;
  @Input() current: number = 0;

  isItemActive(i: number) { return this.current == i; }
  isItemDone(i: number) { return this.current > i; }
  isItemInactive(i: number) { return this.current < i; }

  constructor() { }

  ngOnInit(): void {
  }

}

export interface StepperItem {
  label: string;
  route?: string;
}