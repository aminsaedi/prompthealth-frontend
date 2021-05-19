import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-addon-select-category',
  templateUrl: './addon-select-category.component.html',
  styleUrls: ['./addon-select-category.component.scss']
})
export class AddonSelectCategoryComponent implements OnInit {
  @Input() categories = [];
  selectedCategory = 0;

  constructor(public modal: NgbActiveModal) { }


  ngOnInit(): void {
    console.log(this.categories);
  }

}
