import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { StudioComponent } from './studio.component';
import { StudioBrandComponent } from './brand/studio-brand.component';
import { StudioMonthComponent } from './month/studio-month.component';
import { StudioPostComponent } from './post/studio-post.component';
import { StudioLibraryComponent } from './library/studio-library.component';

/* PromptHealth Pro 2.0's Studio, loaded only when a member opens it. The
 * dashboard's base and its sign-in guard wrap it (dashboard2.module.ts). */
const routes: Routes = [
  {
    path: '', component: StudioComponent, children: [
      { path: 'brand', component: StudioBrandComponent },
      { path: 'month', component: StudioMonthComponent },
      { path: 'post/:id', component: StudioPostComponent },
      { path: 'library', component: StudioLibraryComponent },
    ],
  },
];

@NgModule({
  declarations: [
    StudioComponent,
    StudioBrandComponent,
    StudioMonthComponent,
    StudioPostComponent,
    StudioLibraryComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class StudioModule { }
