import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '../shared/shared.module';
import { SocialItemsModule } from '../social-items/social-items.module';
import { ChartComponent } from './chart/chart.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { LinkAdminComponent } from './link-admin.component';
import { LinkAdminStore } from './link-admin.store';
import { LinkEditorComponent } from './link-editor/link-editor.component';
import { LinkPolicyComponent } from './link-policy/link-policy.component';
import { LoadingComponent } from './loading/loading.component';
import { OverviewComponent } from './overview/overview.component';
import { ReportsComponent } from './reports/reports.component';
import { TaggingComponent } from './tagging/tagging.component';

/* Four pages under one shell. The window picker and the catalog live in the
 * store above them, so moving between pages keeps both rather than refetching. */
const routes: Routes = [
  {
    path: '', component: LinkAdminComponent, children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'links', component: ExplorerComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'tagging', component: TaggingComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [
    LinkAdminComponent,
    OverviewComponent,
    ExplorerComponent,
    ReportsComponent,
    TaggingComponent,
    ChartComponent,
    LinkEditorComponent,
    LinkPolicyComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    SocialItemsModule,
    AgGridModule.withComponents([]),
  ],
  providers: [LinkAdminStore],
})
export class LinkAdminModule {}
