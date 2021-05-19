import { Component, OnInit } from '@angular/core';
import { animate, transition, style, trigger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

// const animation = trigger('carousel', [
//   transition(':enter', [
//     style({ opacity: 0, transform: 'translateX(100%)' }),
//     animate('500ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
//   ]),
//   transition(':leave', [
//     animate('500ms ease', style({ opacity: 0, transform: 'translateX(-100%' })),
//   ]),
// ]);
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // animations: [animation],
})
export class LoginComponent implements OnInit {

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    dots: true,
    cssEase: 'ease'
  };

  public nextPage: string;
  public nextPageKeyword: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
  ) { }


  ngOnInit(): void {
    this._route.queryParams.subscribe((data: QueryParams) => {
      this.nextPage = data.next ? data.next : null;
      this.nextPageKeyword = data.nextKeyword ? data.nextKeyword : null;
    });
    
    this._uService.setMeta(this._router.url, {
      title: 'Login | PromptHealth',
    })
  }
}

interface QueryParams {
  next: string;
  nextKeyword: string;
}
