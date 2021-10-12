import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-addon-select-category',
  templateUrl: './addon-select-category.component.html',
  styleUrls: ['./addon-select-category.component.scss']
})
export class AddonSelectCategoryComponent implements OnInit {
  @Input() categories = [];
  selectedCategory = 0;

  constructor(
  ) { }


  ngOnInit(): void {
    console.log(this.categories);
  }

}
