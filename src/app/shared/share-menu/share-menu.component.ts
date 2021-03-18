import { Component, Input, OnInit } from '@angular/core';
import { style, animate, transition, trigger, } from '@angular/animations';

const animation = trigger('expandVertical', [
  transition(':enter', [
    style({opacity: 0, display: 'block', height: 0}),
    animate('300ms ease', style({opacity: 1, height: 'auto'})),
  ]),
  transition(':leave', [
    animate('300ms ease', style({opacity: 0, height: 0}))
  ]),
])
@Component({
  selector: 'share-menu',
  templateUrl: './share-menu.component.html',
  styleUrls: ['./share-menu.component.scss'],
  animations: [animation]
})
export class ShareMenuComponent implements OnInit {

  @Input() media: string;
  @Input() description: string;

  public isMenuShown = false;
  public socials = [
    {id: 'facebook', label: 'Facebook'},
    {id: 'twitter', label: 'Twitter'},
    {id: 'linkedin', label: 'LinkedIn'},
    {id: 'pinterest', label: 'Pinterest'}
  ]


  constructor() { }

  showMenu(){ this.isMenuShown = true; }
  hideMenu(){ this.isMenuShown = false; }
  toggleMenu(){ this.isMenuShown = !this.isMenuShown; }

  socialLink(type: string){
    let link: string;
    const url = window.location.href;
    switch(type){
      case 'facebook'  : link = 'https://www.facebook.com/share.php?u=' + url ; break;
      case 'twitter'   : link = 'https://twiter.com/share?url=' + url; break;
      case 'linkedin'  : link = 'https://www.linkedin.com/shareArticle?mini=true&url=' + url; break;
      case 'pinterest' : link = `https://www.pinterest.com/pin/create/button/?url=${url}&media=${this.media}&description=${this.description}`
    }
    return link;
  }

  ngOnInit(): void {
  }

}
