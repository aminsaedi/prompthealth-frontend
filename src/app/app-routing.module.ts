import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { ThemeModule } from './theme/theme.module';
import { HttpClientModule } from '@angular/common/http';

//Bootstrap
import { CommonModule } from "@angular/common";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ModalModule } from "ngx-bootstrap/modal";


const routes: Routes = [
  {
    path: '',
    loadChildren: () => ThemeModule
  },
];

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    HttpClientModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    TooltipModule.forRoot(),
  ],
  exports: [
    BsDropdownModule,
    HttpClientModule,
    ModalModule,
    RouterModule,
    TooltipModule,
  ]
})
export class AppRoutingModule { }
