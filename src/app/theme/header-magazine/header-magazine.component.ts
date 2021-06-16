import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss']
})
export class HeaderMagazineComponent implements OnInit {

  public isShadowShown: boolean = false; 
  
  constructor() { }

  ngOnInit(): void {
  }

  showMenu() {}

}
