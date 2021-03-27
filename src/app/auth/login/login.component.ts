import { Component, OnInit } from '@angular/core';
import { animate, transition, style, trigger } from '@angular/animations';

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

  constructor() { }


  ngOnInit(): void {
  }

}
