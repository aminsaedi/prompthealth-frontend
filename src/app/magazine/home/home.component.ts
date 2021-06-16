import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public idxCategoryActive: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  onTapCategory(i: number) {
    this.idxCategoryActive = i;
  }

}
