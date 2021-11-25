import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonSortComponent } from './button-sort/button-sort.component';
import { SharedModule } from '../shared/shared.module';
import { ButtonFilterComponent } from './button-filter/button-filter.component';
import { ButtonGobackComponent } from './button-goback/button-goback.component';



@NgModule({
  declarations: [
    ButtonSortComponent,
    ButtonFilterComponent,
    ButtonGobackComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    ButtonSortComponent,
    ButtonFilterComponent,
    ButtonGobackComponent,
  ]
  ,
})
export class ButtonsModule { }
