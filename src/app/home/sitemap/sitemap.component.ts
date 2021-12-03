import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { QuestionnaireAnswer, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss']
})
export class SitemapComponent implements OnInit {

  constructor(
    private _qService: QuestionnaireService,
    private _route: ActivatedRoute,
  ) {}

  public typeOfProviderList: QuestionnaireAnswer[];

  @ViewChild('typeOfProvider') private typeOfProvider: ElementRef;

  ngAfterViewInit() {
    this._route.fragment.pipe( first() ).subscribe(fragment => {
      setTimeout(() => {
        if(fragment == 'type-of-provider' && this.typeOfProvider && this.typeOfProvider.nativeElement) {
          const el: HTMLAnchorElement = this.typeOfProvider.nativeElement;
          const elTop = el.getBoundingClientRect().top;
          // console.log(elTop)
          smoothWindowScrollTo(elTop);
        }          
      }, 100);
    });

  }

  ngOnInit(): void {
    this._qService.getSitemap().then(data => { 
      this.typeOfProviderList =data.typeOfProvider.answers;
    });
  }
}
