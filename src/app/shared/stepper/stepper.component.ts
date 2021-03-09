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

  @Input() type: string = 'regular';
  @Input() current: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}

export interface StepperItem {
  label: string;
  route?: string;
}